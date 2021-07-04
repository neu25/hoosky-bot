import * as Discord from './Discord';
import TriggerContext from './TriggerContext';

type TriggerHandler<E extends Discord.Event> = (
  // @ts-ignore
  ctx: TriggerContext<EventData<E>>,
) => void | Promise<void>;

type TriggerProps<E extends Discord.Event> = {
  event: E;
  handler?: TriggerHandler<E>;
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
};

export type EventData<E extends keyof EventTypeMap> = EventTypeMap[E];

class Trigger<E extends Discord.Event> {
  readonly event: Discord.Event;
  private readonly _handler?: TriggerHandler<E>;

  constructor(props: TriggerProps<E>) {
    this.event = props.event;
    this._handler = props.handler;
  }

  execute(ctx: TriggerContext<any>): void | Promise<void> {
    if (this._handler) {
      return this._handler(ctx);
    }
  }
}

export default Trigger;
