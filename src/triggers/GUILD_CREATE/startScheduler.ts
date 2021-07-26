import * as Discord from '../../Discord';
import Trigger from '../../Trigger';

const startScheduler = new Trigger({
  event: Discord.Event.GUILD_CREATE,
  handler: async ctx => {
    const guildId = ctx.data.id;
    return ctx.scheduler.startSchedulerWithDefaultJobs(guildId);
  },
});

export default startScheduler;
