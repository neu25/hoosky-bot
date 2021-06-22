import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import configureScheduler, {
  startScheduler,
} from '../../commands/birthday/scheduler';

const birthdayScheduler = new Trigger<Discord.Event.CHANNEL_UPDATE>({
  event: Discord.Event.CHANNEL_UPDATE,
  handler: async ctx => {
    const guildId = ctx.getData().id;

    await configureScheduler(ctx, guildId);
    await startScheduler();
  },
});

export default birthdayScheduler;
