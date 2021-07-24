import { Emoji } from './message';
import { PresenceUpdate, Role, User } from './user';

export enum GuildFeature {
  ANIMATED_ICON = 'ANIMATED_ICON',
  BANNER = 'BANNER',
  COMMERCE = 'COMMERCE',
  COMMUNITY = 'COMMUNITY',
  DISCOVERABLE = 'DISCOVERABLE',
  FEATURABLE = 'FEATURABLE',
  INVITE_SPLASH = 'INVITE_SPLASH',
  MEMBER_VERIFICATION_GATE_ENABLED = 'MEMBER_VERIFICATION_GATE_ENABLED',
  NEWS = 'NEWS',
  PARTNERED = 'PARTNERED',
  PREVIEW_ENABLED = 'PREVIEW_ENABLED',
  VANITY_URL = 'VANITY_URL',
  VERIFIED = 'VERIFIED',
  VIP_REGIONS = 'VIP_REGIONS',
  WELCOME_SCREEN_ENABLED = 'WELCOME_SCREEN_ENABLED',
}

export type GuildMember = {
  user?: User;
  nick?: string;
  roles: string[];
  joined_at: string;
  premium_since?: string;
  deaf: boolean;
  mute: boolean;
  pending?: boolean;
  permissions?: string;
};

export type UnavailableGuild = Pick<Guild, 'id' | 'unavailable'>;

export type VoiceState = {
  guild_id?: string;
  channel_id: string;
  user_id: string;
  member?: GuildMember;
  session_id: string;
  deaf: boolean;
  mute: boolean;
  self_deaf: boolean;
  self_mute: boolean;
  self_stream?: boolean;
  self_video: boolean;
  suppress: boolean;
  request_to_speak_timestamp: string;
};

export type Guild = {
  id: string;
  name: string;
  icon: string;
  icon_hash?: string;
  splash: string;
  discovery_splash: string;
  owner?: boolean;
  owner_id: string;
  permissions?: string;
  region: string;
  afk_channel_id: string;
  afk_timeout: number;
  widget_enabled?: boolean;
  widget_channel_id?: string;
  verification_level: number;
  default_message_notifications: number;
  explicit_content_filter: number;
  roles: Role[];
  emojis: Emoji[];
  features: GuildFeature[];
  mfa_level: number;
  application_id: string;
  system_channel_id: string;
  system_channel_flags: number;
  rules_channel_id: string;
  joined_at?: string;
  large?: boolean;
  unavailable: boolean;
  member_count?: number;
  voice_states?: Exclude<VoiceState, 'guild_id'>[];
  members?: GuildMember[];
  channels?: Channel[];
  threads?: Channel[];
  presences?: PresenceUpdate[];
  // ... and many other omitted fields.
  // https://discord.com/developers/docs/resources/guild#guild-object
};

export type GuildRoleCreatePayload = {
  guild_id: string;
  role: Role;
};

export type GuildRoleUpdatePayload = GuildRoleCreatePayload;

export type GuildRoleDeletePayload = {
  guild_id: string;
  role_id: string;
};

export type GuildMemberAddPayload = GuildMember & { guild_id: string };

export type GuildMemberUpdatePayload = {
  guild_id: string;
  roles: string[];
  user: User;
  nick?: string;
  joined_at: string;
  premium_since?: string;
  deaf?: boolean;
  mute?: boolean;
  pending?: boolean;
};

export type GuildMemberRemovePayload = {
  guild_id: string;
  user: User;
};

export type Overwrite = {
  id: string;
  type: number;
  allow: string;
  deny: string;
};

export enum ChannelType {
  GUILD_TEXT,
  DM,
  GUILD_VOICE,
  GROUP_DM,
  GUILD_CATEGORY,
  GUILD_NEWS,
  GUILD_STORE,
  GUILD_NEWS_THREAD = 10,
  GUILD_PUBLIC_THREAD,
  GUILD_PRIVATE_THREAD,
  GUILD_STAGE_VOICE,
}

export type Channel = {
  id: string;
  type: number;
  guild_id?: string;
  position?: number;
  permission_overwrites?: Overwrite[];
  name?: string;
  topic?: string;
  nsfw?: boolean;
  last_message_id?: string;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  recipients?: User[];
  icon?: string;
  owner_id?: string;
  application_id?: string;
  parent_id?: string;
  last_pin_timestamp?: string;
  rtc_region?: string;
  video_quality_mode?: number;
  message_count?: number;
  member_count?: number;
  thread_metadata?: ThreadMetadata;
  member?: ThreadMember;
};

export type ThreadMetadata = {
  archived: boolean;
  archiver_id?: string;
  auto_archive_duration: number;
  archive_timestamp: string;
  locked?: boolean;
};

export type ThreadMember = {
  id: string;
  user_id: string;
  join_timestamp: string;
  flags: number;
};

export type CreateChannelPayload = {
  name: string;
} & Pick<
  Channel,
  | 'permission_overwrites'
  | 'parent_id'
  | 'nsfw'
  | 'position'
  | 'rate_limit_per_user'
  | 'user_limit'
  | 'bitrate'
  | 'topic'
  | 'type'
>;

export type ModifyChannelPayload = {
  type?: ChannelType.GUILD_TEXT | ChannelType.GUILD_NEWS;
  rtc_region?: string;
  video_quality_mode?: number;
  default_auto_archive_duration?: number;
} & Partial<Omit<CreateChannelPayload, 'type'>>;
