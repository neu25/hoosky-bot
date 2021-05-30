import { Emoji } from './message';
import { ClientStatus } from './application';

export type User = {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
};

export type PresenceUpdate = {
  user: User;
  guild_id: string;
  status: string;
  activities: Activity[];
  client_status: ClientStatus;
};

export type Activity = {
  name: string;
  type: number;
  url?: string;
  created_at: number;
  timestamps?: ActivityTimestamp;
  application_id?: string;
  details?: string;
  state?: string;
  emoji?: Emoji;
  // ... and several other omitted fields.
  // https://discord.com/developers/docs/topics/gateway#activity-object
};

export type ActivityTimestamp = {
  start?: number;
  end?: number;
};

export type Role = {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  tags?: RoleTag;
};

export type RoleTag = {
  bot_id?: string;
  integration_id?: string;
  premium_subscriber?: null;
};
