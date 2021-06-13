import * as Discord from './index';

/**
 * The fundamental structure all gateway messages take on.
 */
export type GatewayMessage = {
  op: Opcode;
  d?: unknown;
  s?: number;
  t?: Discord.Event;
};

export enum Opcode {
  Dispatch,
  Heartbeat,
  Identify,
  PresenceUpdate,
  VoiceStateUpdate,
  Resume = 6,
  Reconnect,
  RequestGuildMembers,
  InvalidSession,
  Hello,
  HeartbeatACK,
}

/**
 * Types of payloads that we will send or receive from Discord.
 */

export type HelloPayload = {
  heartbeat_interval: number;
};

export type IdentifyPayload = {
  token: string;
  properties: IdentifyConnectionProperties;
  compress?: boolean;
  large_threshold?: number;
  intents: number;
};

type IdentifyConnectionProperties = {
  $os: string;
  $browser: string;
  $device: string;
};

export type ReadyPayload = {
  v: number;
  user: Discord.User;
  guilds: Discord.UnavailableGuild[];
  session_id: string;
  application: Pick<Discord.Application, 'id' | 'flags'>;
};

export type ResumePayload = {
  token: string;
  session_id: string;
  seq: number;
};
