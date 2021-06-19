import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import commands from '../../commands';

const syncCommands = new Trigger<Discord.Event.GUILD_CREATE>({
  event: Discord.Event.GUILD_CREATE,
  handler: async ctx => {
    const data = ctx.getData();

    console.log(`Synchronizing commands with ${data.name} (${data.id})`);
    const serialized = Object.values(commands).map(cmd => cmd.serialize());
    await ctx.api.bulkOverwriteGuildCommands(data.id, serialized);
  },
});

export default syncCommands;
