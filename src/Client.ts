import WebSocket from 'ws';
import { AxiosInstance } from 'axios';
import * as Discord from './Discord';
import ExecutionContext from './ExecutionContext';
import Command from './Command';
import Trigger from './Trigger';
import TriggerContext from './TriggerContext';
import { Repositories } from './repository';

// The delay between reconnections, in milliseconds.
const RECONNECT_DELAY = 1000;

/**
 * Client connects to the Discord bot gateway and maintains the connection.
 */
class Client {
  // The WebSocket connection object.
  private _ws?: WebSocket;

  // The Discord bot token.
  private readonly _token: string;
  // The Discord bot application ID.
  private readonly _appId: string;

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

  // The axios client to pass to the ExecutionContext
  private readonly _client: AxiosInstance;

  // A callback function to be called when the connection is established.
  private _connectCallback?: (data: Discord.ReadyPayload) => void;

  private readonly _repos: Repositories;

  constructor(
    appId: string,
    token: string,
    repos: Repositories,
    client: AxiosInstance,
    intents: Discord.Intent[],
  ) {
    this._appId = appId;
    this._token = token;
    this._repos = repos;
    this._lastSeqNum = null;
    this._commands = {};
    this._triggers = {};
    this._intents = intents.reduce((prev, cur) => prev | cur);
    this._client = client;
  }

  /**
   * Uses the provided map of commands, appropriately executing them when
   * a user runs them.
   *
   * @param commands The commands to use.
   */
  handleCommands(commands: Record<string, Command>): void {
    // Create a map of names and the corresponding commands.
    const mapping: Record<string, Command> = {};
    for (const cmd of Object.values(commands)) {
      mapping[cmd.getName()] = cmd;
    }
    this._commands = mapping;
  }

  /**
   * Uses the provided map of triggers, appropriately executing them when
   * a user runs them.
   *
   * @param triggers The triggers to use.
   */
  handleTriggers(
    triggers: Partial<Record<Discord.Event, Trigger<any>[]>>,
  ): void {
    this._triggers = triggers;
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
      console.log('WebSocket connection opened');
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
      console.log('WebSocket connection closed', code, reason);
      setTimeout(() => {
        this.connect().catch(err => {
          console.error(err);
        });
      }, RECONNECT_DELAY);
    });

    return new Promise(resolve => (this._connectCallback = resolve));
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
        this._sessionId = ready.session_id;
        if (this._connectCallback) {
          this._connectCallback(ready);
        }
        break;
      }
      case Discord.Event.INTERACTION_CREATE: {
        const interaction = data as Discord.Interaction;

        if (interaction.data) {
          const command = this._commands[interaction.data.name];
          if (command) {
            await command.execute(
              new ExecutionContext(
                this._appId,
                this._repos,
                interaction,
                this._client,
              ),
            );
          }
        }
        break;
      }
      default:
      // console.log(type);
      // console.log(data);
    }

    const triggers = this._triggers[type];
    if (triggers) {
      const ctx = new TriggerContext(
        this._appId,
        this._client,
        this._repos,
        data,
      );
      for (const t of triggers) {
        t.execute(ctx);
      }
    }
  }

  /**
   * Begins the periodic heartbeat sending loop.
   *
   * @param interval How often to send a heartbeat, in milliseconds.
   */
  private _beginHeartbeat(interval: number) {
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
  private _sendMessage(msg: Discord.GatewayMessage) {
    if (!this._ws) throw new Error('WebSocket connection not initialized');
    this._ws.send(JSON.stringify(msg));
  }

  /**
   * Sends a heartbeat message to the gateway.
   */
  private _sendHeartbeat() {
    this._sendMessage({
      op: Discord.Opcode.Heartbeat,
      d: this._lastSeqNum,
    });
  }

  /**
   * Identifies the bot with the gateway after a prior disconnection.
   */
  private _sendResume() {
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
  private _sendIdentify() {
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
