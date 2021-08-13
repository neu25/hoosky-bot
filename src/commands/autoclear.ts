import Command from '../Command';
import CommandOption from '../CommandOption';
import * as Discord from '../Discord';

const autoclear = new Command({
  name: 'autoclear',
  displayName: 'Autoclear',
  description: 'Automatically clear channel',
  requiredPermissions: [Discord.Permission.MANAGE_CHANNELS],
  options: [
    new CommandOption({
      name: 'channel',
      description: 'Channel to automatically clear',
      required: true,
      type: Discord.CommandOptionType.CHANNEL,
    }),
    new CommandOption({
      name: 'duration',
      description: 'Number of hours before autoclearing',
      required: true,
      type: Discord.CommandOptionType.INTEGER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const channel = ctx.getArgument<string>('channel')!;
    const duration = ctx.getArgument<number>('duration')!;

    if (duration === 0) {
      await ctx.repos.autoclear.delete(guildId, channel);
      return ctx.interactionApi.respondWithMessage(
        `Disabled autoclearing of <#${channel}>`,
      );
    }

    await ctx.repos.autoclear.set(guildId, channel, duration);

    return ctx.interactionApi.respondWithMessage(
      `Messages in <#${channel}> will be cleared after ${duration} hours`,
    );
  },
});

export default autoclear;
