import WebSocket from 'ws';
import * as Discord from './Discord';
import ExecutionContext from './ExecutionContext';
import Command from './Command';

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

  // Dynamic parameters supplied by the Discord gateway.
  private _heartbeatInterval?: NodeJS.Timeout;
  private _lastSeqNum: number | null;
  private _sessionId?: string;

  // A callback function to be called when the connection is established.
  private _connectCallback?: (data: Discord.ReadyPayload) => void;

  constructor(appId: string, token: string) {
    this._token = token;
    this._appId = appId;
    this._lastSeqNum = null;
    this._commands = {};
  }

  handleCommands(commands: Record<string, Command>): void {
    this._commands = commands;
  }

  /**
   * Connects the bot to the gateway. When the connection breaks, it
   * automatically reconnects and replays missed messages.
   */
  connect(): Promise<Discord.ReadyPayload> {
    this._ws = new WebSocket('wss://gateway.discord.gg/?v=9&encoding=json');

    this._ws.on('message', raw => {
      const msg = JSON.parse(String(raw)) as Discord.GatewayMessage;
      this._handleMessage(msg).catch(err => {
        console.error(err);
      });
    });

    this._ws.on('error', err => {
      console.error(err);
    });

    this._ws.on('close', () => {
      console.log('Connection closed');
      this.connect().catch(err => {
        console.error(err);
      });
    });

    return new Promise(resolve => (this._connectCallback = resolve));
  }

  /**
   * Handles a message from the gateway.
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
              new ExecutionContext(this._appId, interaction),
            );
          }
        }
        break;
      }
    }
  }

  /**
   * Begins the periodic heartbeat sending loop.
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
   * @param msg
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
      intents: 0,
    };

    this._sendMessage({
      op: Discord.Opcode.Identify,
      d: data,
    });
  }
}

export default Client;
