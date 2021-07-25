import * as Discord from '../../Discord';
import Trigger from '../../Trigger';

const scheduler = new Trigger({
  event: Discord.Event.GUILD_CREATE,
  handler: async ctx => {
    const guild = ctx.data;
    console.log(`Creating scheduler for ${guild.name} (${guild.id})`);

    return ctx.scheduler._startScheduler(guild.id);
  },
});

export default scheduler;
