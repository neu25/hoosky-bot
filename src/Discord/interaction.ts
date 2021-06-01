import {
  AllowedMentions,
  Embed,
  Message,
  MessageComponentType,
} from './message';
import { Channel, GuildMember } from './guild';
import { Role, User } from './user';

export type InteractionResponse = {
  type: InteractionCallbackType;
  data?: InteractionCommandCallbackData;
};

export enum InteractionCallbackType {
  Pong = 1,
  ChannelMessageWithSource = 4,
  DeferredChannelMessageWithSource = 5,
  DeferredUpdateMessage = 6,
  UpdateMessage = 7,
}

export type InteractionCommandCallbackData = {
  tts?: boolean;
  content?: string;
  embeds?: Embed[];
  allowed_mentions?: AllowedMentions;
  flags?: number;
};

export type Interaction = {
  id: string;
  application_id: string;
  type: InteractionType;
  data?: CommandInteractionData;
  guild_id?: string;
  channel_id?: string;
  member?: GuildMember;
  user?: User;
  token: string;
  version: number;
  message?: Message;
};

export type CommandInteractionData = {
  id: string;
  name: string;
  resolved?: CommandInteractionDataResolved;
  options?: CommandInteractionDataOption[];
  custom_id: string;
  component_type: MessageComponentType;
};

export type CommandInteractionDataOption = {
  name: string;
  type: CommandOptionType;
  value?: OptionType;
  options?: CommandInteractionDataOption[];
};

export type OptionType = string | number | boolean | User | Channel | Role;

export enum CommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP,
  STRING,
  INTEGER,
  BOOLEAN,
  USER,
  CHANNEL,
  ROLE,
  MENTIONABLE,
}

export type CommandInteractionDataResolved = {
  users?: Record<string, User>;
  members?: Record<string, Omit<GuildMember, 'user' | 'deaf' | 'mute'>>;
  roles?: Record<string, Role>;
  channels?: Record<
    string,
    Pick<Channel, 'id' | 'name' | 'type' | 'permission_overwrites'>
  >;
};

export enum InteractionType {
  Ping = 1,
  ApplicationCommand,
  MessageComponent,
}

export type MessageInteraction = {
  id: string;
  type: InteractionType;
  name: string;
  user: User;
};
