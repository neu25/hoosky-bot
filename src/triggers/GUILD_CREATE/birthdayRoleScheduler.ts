import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import {
  configureSchedulers,
  startSchedulers,
} from '../../commands/birthday/roleScheduler';

const roleScheduler = new Trigger({
  event: Discord.Event.GUILD_CREATE,
  handler: async ctx => {
    const guild = ctx.data;
    console.log(
      `Setting up birthday role scheduler for ${guild.name} (${guild.id})...`,
    );

    await configureSchedulers(ctx, guild.id);
    await startSchedulers();

    console.log(
      `Birthday role scheduler for ${guild.name} (${guild.id}) is configured`,
    );
  },
});

export default roleScheduler;
