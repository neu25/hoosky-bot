import * as Discord from './Discord';
import TriggerContext from './TriggerContext';

type TriggerHandler<E extends Discord.Event> = (
  // @ts-ignore
  ctx: TriggerContext<EventData<E>>,
) => void | Promise<void>;

type TriggerProps<E extends Discord.Event> = {
  event: Discord.Event;
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
  [Discord.Event.INTERACTION_CREATE]: Discord.Interaction;
};

export type EventData<E extends keyof EventTypeMap> = EventTypeMap[E];

class Trigger<E extends Discord.Event> {
  private readonly _event: Discord.Event;
  private readonly _handler?: TriggerHandler<E>;

  constructor(props: TriggerProps<E>) {
    this._event = props.event;
    this._handler = props.handler;
  }

  getEvent(): Discord.Event {
    return this._event;
  }

  execute(ctx: TriggerContext<any>): void | Promise<void> {
    if (this._handler) {
      return this._handler(ctx);
    }
  }
}

export default Trigger;
