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

export enum StatusType {
  Online = 'online',
  Dnd = 'dnd',
  Idle = 'idle',
  Invisible = 'invisible',
  Offline = 'offline',
}

export type PresenceUpdatePayload = {
  since: number | null;
  activities: Activity[];
  status: StatusType;
  afk: boolean;
};

export enum ActivityType {
  Game,
  Streaming,
  Listening,
  Watching,
  Custom,
  Competing,
}

export type ActivityTimestamps = {
  start?: number; // Unix
  end?: number;
};

export type ActivityEmoji = {
  name: string;
  id?: string;
  animated?: boolean;
};

export type Activity = {
  name: string;
  type: ActivityType;
  url?: string; // For `Streaming` only
  created_at: number; // Unix
  timestamps?: ActivityTimestamps;
  application_id?: string;
  details?: string;
  state?: string;
  emoji?: ActivityEmoji;
  // ... more at https://discord.com/developers/docs/topics/gateway#activity-object
};
