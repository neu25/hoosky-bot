import * as Discord from './Discord';
import TriggerContext from './TriggerContext';
import { MessageFollowUpHandler } from './FollowUpManager';

type TriggerHandler<E extends Discord.Event> = (
  // @ts-ignore
  ctx: TriggerContext<EventData<E>>,
) => void | Promise<void>;

type TriggerProps<E extends Discord.Event> = {
  event: E;
  handler?: TriggerHandler<E>;
  msgFollowUpHandlers?: Record<string, MessageFollowUpHandler>;
};

type EventTypeMap = {
  [Discord.Event.READY]: Discord.ReadyPayload;
  [Discord.Event.GUILD_CREATE]: Discord.Guild;
  [Discord.Event.GUILD_UPDATE]: Discord.Guild;
  [Discord.Event.GUILD_DELETE]: Discord.UnavailableGuild;
  [Discord.Event.GUILD_ROLE_CREATE]: Discord.GuildRoleCreatePayload;
  [Discord.Event.GUILD_ROLE_UPDATE]: Discord.GuildRoleUpdatePayload;
  [Discord.Event.GUILD_ROLE_DELETE]: Discord.GuildRoleDeletePayload;
  [Discord.Event.CHANNEL_CREATE]: Discord.Channel;
  [Discord.Event.CHANNEL_UPDATE]: Discord.Channel;
  [Discord.Event.CHANNEL_DELETE]: Discord.Channel;
  [Discord.Event.GUILD_MEMBER_ADD]: Discord.GuildMemberAddPayload;
  [Discord.Event.GUILD_MEMBER_UPDATE]: Discord.GuildMemberUpdatePayload;
  [Discord.Event.GUILD_MEMBER_REMOVE]: Discord.GuildMemberRemovePayload;
  [Discord.Event.INTERACTION_CREATE]: Discord.Interaction;
  [Discord.Event.MESSAGE_CREATE]: Discord.Message;
  [Discord.Event.MESSAGE_UPDATE]: Partial<Discord.Message> &
    Pick<Discord.Message, 'id' | 'channel_id'>;
  [Discord.Event.MESSAGE_DELETE]: Discord.DeleteMessagePayload;
  [Discord.Event.MESSAGE_REACTION_ADD]: Discord.MessageReactionAddPayload;
  [Discord.Event.MESSAGE_REACTION_REMOVE]: Discord.MessageReactionRemovePayload;
  [Discord.Event
    .MESSAGE_REACTION_REMOVE_ALL]: Discord.MessageReactionRemoveAllPayload;
  [Discord.Event
    .MESSAGE_REACTION_REMOVE_EMOJI]: Discord.MessageReactionRemoveEmojiPayload;
};

export type EventData<E extends keyof EventTypeMap> = EventTypeMap[E];

class Trigger<E extends Discord.Event> {
  readonly event: Discord.Event;
  readonly msgFollowUpHandlers: Record<string, MessageFollowUpHandler>;
  private readonly _handler?: TriggerHandler<E>;

  constructor(props: TriggerProps<E>) {
    this.event = props.event;
    this._handler = props.handler;
    this.msgFollowUpHandlers = props.msgFollowUpHandlers ?? {};
  }

  execute(ctx: TriggerContext<any>): void | Promise<unknown> {
    // Supply this subcommand's follow-up handlers.
    ctx.msgFollowUpHandlers = this.msgFollowUpHandlers;

    if (this._handler) {
      return this._handler(ctx);
    }
  }
}

export default Trigger;
