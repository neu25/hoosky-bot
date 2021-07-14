import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import {
  configureScheduler,
  startScheduler,
} from '../../commands/birthday/messageScheduler';

const birthdayMessageScheduler = new Trigger({
  event: Discord.Event.GUILD_CREATE,
  handler: async ctx => {
    const guild = ctx.data;
    console.log(
      `Setting up birthday scheduler for ${guild.name} (${guild.id})...`,
    );

    await configureScheduler(ctx, guild.id);
    await startScheduler();

    console.log(
      `Birthday scheduler for ${guild.name} (${guild.id}) is configured`,
    );
  },
});

export default birthdayMessageScheduler;
