import WebSocket from 'ws';
import { AxiosInstance } from 'axios';
import * as Discord from './Discord';
import ExecutionContext from './ExecutionContext';
import Command from './Command';
import Trigger from './Trigger';
import TriggerContext from './TriggerContext';
import { Repositories } from './repository';
import Api from './Api';
import FollowUpManager from './FollowUpManager';
import InteractionManager from './InteractionManager';
import InteractionApi from './InteractionApi';
import Debouncer from './Debouncer';
import MasterScheduler from './MasterScheduler';

// The delay between reconnections, in milliseconds.
const RECONNECT_DELAY = 1000;

export type ClientOpts = {
  appId: string;
  token: string;
  repos: Repositories;
  http: AxiosInstance;
  api: Api;
  intents: Discord.Intent[];
  followUpManager: FollowUpManager;
  interactionManager: InteractionManager;
};

/**
 * Client connects to the Discord bot gateway and maintains the connection.
 */
class Client {
  // The WebSocket connection object.
  private _ws?: WebSocket;
  readonly api: Api;
  readonly followUpManager: FollowUpManager;
  readonly interactionManager: InteractionManager;
  readonly debouncer: Debouncer;
  readonly scheduler: MasterScheduler;

  // The Discord bot token.
  private readonly _token: string;
  // The Discord bot application ID.
  readonly appId: string;
  // The Discord bot user.
  user?: Discord.User;

  // The commands that the bot should handle.
  private _commands: Record<string, Command>;
  // The triggers that the bot should handle.
  private _triggers: Partial<Record<Discord.Event, Trigger<any>[]>>;
  // The intents that the bot listens to.
  private readonly _intents: number;

  // Dynamic parameters supplied by the Discord gateway.
  private _heartbeatInterval?: NodeJS.Timeout;
  private _lastSeqNum: number | null;
  private _sessionId?: string;

  // The axios client to pass to the execution context
  readonly http: AxiosInstance;

  // A callback function to be called when the connection is established.
  private _connectCallback?: (data: Discord.ReadyPayload) => void;

  readonly repos: Repositories;

  constructor(opts: ClientOpts) {
    this.appId = opts.appId;
    this.repos = opts.repos;
    this._token = opts.token;
    this._lastSeqNum = null;
    this._commands = {};
    this._triggers = {};
    this._intents = opts.intents.reduce((prev, cur) => prev | cur);
    this.http = opts.http;
    this.api = opts.api;
    this.followUpManager = opts.followUpManager;
    this.interactionManager = opts.interactionManager;
    this.debouncer = new Debouncer();
    this.scheduler = new MasterScheduler(opts.api, opts.repos);
  }

  /**
   * Uses the provided map of commands, appropriately executing them when
   * a user runs them.
   *
   * @param commands The commands to use.
   */
  setCommands(commands: Command[]): void {
    // Create a map of names and the corresponding commands.
    const mapping: Record<string, Command> = {};
    for (const cmd of commands) {
      mapping[cmd.name] = cmd;
    }
    this._commands = mapping;
  }

  /**
   * Uses the provided array of triggers, appropriately executing them when
   * a user runs them.
   *
   * @param triggers The triggers to use.
   */
  setTriggers(triggers: Trigger<any>[]): void {
    const map: Partial<Record<string, Trigger<any>[]>> = {};
    for (const t of triggers) {
      if (!map[t.event]) {
        map[t.event] = [];
      }
      map[t.event]!.push(t);
    }
    this._triggers = map;
  }

  /**
   * Connects the bot to the gateway. When the connection breaks, it
   * automatically reconnects and replays missed messages.
   */
  connect(): Promise<Discord.ReadyPayload> {
    // Close any existing WebSocket connection.
    this._ws?.close();
    this._ws = new WebSocket('wss://gateway.discord.gg/?v=9&encoding=json');

    this._ws.on('open', () => {
      console.log('[Client] WebSocket connection opened');
    });

    this._ws.on('message', raw => {
      const msg = JSON.parse(String(raw)) as Discord.GatewayMessage;
      this._handleMessage(msg).catch(err => {
        console.error(err);
      });
    });

    this._ws.on('error', err => {
      console.error(err);
    });

    this._ws.on('close', (code, reason) => {
      console.log('[Client] WebSocket connection closed', code, reason);
      setTimeout(() => {
        this.connect().catch(err => {
          console.error(err);
        });
      }, RECONNECT_DELAY);
    });

    return new Promise(resolve => (this._connectCallback = resolve));
  }

  /**
   * Updates the presence (AKA status) of the bot.
   *
   * @param data The presence data.
   */
  updatePresence(data: Discord.PresenceUpdatePayload): void {
    this._sendMessage({
      op: Discord.Opcode.PresenceUpdate,
      d: data,
    });
  }

  /**
   * Handles a message from the gateway.
   *
   * @param msg
   */
  private async _handleMessage(msg: Discord.GatewayMessage) {
    switch (msg.op) {
      case Discord.Opcode.Hello: {
        const data = msg.d as Discord.HelloPayload;
        this._beginHeartbeat(data.heartbeat_interval);
        if (this._sessionId) {
          this._sendResume();
        } else {
          this._sendIdentify();
        }
        break;
      }
      case Discord.Opcode.Heartbeat: {
        this._sendHeartbeat();
        break;
      }
      case Discord.Opcode.HeartbeatACK: {
        break;
      }
      case Discord.Opcode.Dispatch: {
        this._lastSeqNum = msg.s as number;
        if (!msg.t) return;
        await this._handleEvent(msg.t, msg.d);
        break;
      }
      case Discord.Opcode.InvalidSession: {
        this._ws?.close();
        break;
      }
      default:
        console.log('[Client] Unhandled gateway message:', msg);
    }
  }

  /**
   * Handles the event dispatch from Discord.
   *
   * @param type The event type.
   * @param data The event data.
   */
  private async _handleEvent(type: Discord.Event, data: unknown) {
    switch (type) {
      case Discord.Event.READY: {
        const ready = data as Discord.ReadyPayload;
        this.user = ready.user;
        this._sessionId = ready.session_id;
        if (this._connectCallback) {
          this._connectCallback(ready);
        }
        break;
      }
      case Discord.Event.INTERACTION_CREATE: {
        await this._handleInteraction(data as Discord.Interaction);
        break;
      }
      case Discord.Event.MESSAGE_CREATE: {
        const msg = data as Discord.Message;
        await this.followUpManager.handleMessage(
          msg,
          new TriggerContext<Discord.Message>({
            scheduler: this.scheduler,
            debouncer: this.debouncer,
            botUser: this.user!,
            api: this.api,
            repos: this.repos,
            followUpManager: this.followUpManager,
            data: msg,
          }),
        );
        break;
      }
    }

    const triggers = this._triggers[type];
    if (triggers) {
      console.log('[Client] Handling trigger', type);
      const ctx = new TriggerContext({
        scheduler: this.scheduler,
        debouncer: this.debouncer,
        botUser: this.user!,
        repos: this.repos,
        api: this.api,
        followUpManager: this.followUpManager,
        data,
      });
      for (const t of triggers) {
        t.execute(ctx);
      }
    }
  }

  private async _handleInteraction(interaction: Discord.Interaction) {
    if (!interaction.data) return;

    const ctx = new ExecutionContext({
      scheduler: this.scheduler,
      debouncer: this.debouncer,
      botUser: this.user!,
      repos: this.repos,
      api: this.api,
      client: this,
      followUpManager: this.followUpManager,
      interactionApi: new InteractionApi({
        interaction,
        http: this.http,
        appId: this.appId,
      }),
      interaction,
    });

    switch (interaction.type) {
      case Discord.InteractionType.ApplicationCommand: {
        const command = this._commands[interaction.data.name];
        if (command) {
          console.log('[Client] Handling command', command.name);
          await command.execute(ctx);
        }
        break;
      }
      case Discord.InteractionType.MessageComponent: {
        await this.interactionManager.handleInteraction(interaction, ctx);
        break;
      }
    }
  }

  /**
   * Begins the periodic heartbeat sending loop.
   *
   * @param interval How often to send a heartbeat, in milliseconds.
   */
  private _beginHeartbeat(interval: number): void {
    if (this._heartbeatInterval) {
      clearInterval(this._heartbeatInterval);
    }
    this._heartbeatInterval = setInterval(
      () => this._sendHeartbeat(),
      interval,
    );
  }

  /**
   * Sends a message to the gateway.
   *
   * @param msg The raw Discord gateway message.
   */
  private _sendMessage(msg: Discord.GatewayMessage): void {
    if (!this._ws) throw new Error('WebSocket connection not initialized');
    this._ws.send(JSON.stringify(msg));
  }

  /**
   * Sends a heartbeat message to the gateway.
   */
  private _sendHeartbeat(): void {
    this._sendMessage({
      op: Discord.Opcode.Heartbeat,
      d: this._lastSeqNum,
    });
  }

  /**
   * Identifies the bot with the gateway after a prior disconnection.
   */
  private _sendResume(): void {
    if (this._sessionId === undefined || this._lastSeqNum === null) {
      return this._sendIdentify();
    }

    const data: Discord.ResumePayload = {
      token: this._token,
      session_id: this._sessionId,
      seq: this._lastSeqNum,
    };

    this._sendMessage({
      op: Discord.Opcode.Resume,
      d: data,
    });
  }

  /**
   * Identifies the bot with the gateway for the first time.
   */
  private _sendIdentify(): void {
    const data: Discord.IdentifyPayload = {
      token: this._token,
      properties: {
        $os: 'linux',
        $browser: 'hoosky',
        $device: 'hoosky',
      },
      intents: this._intents,
    };

    this._sendMessage({
      op: Discord.Opcode.Identify,
      d: data,
    });
  }
}

export default Client;
