import * as Discord from '../Discord';
import Command from '../Command';
import CommandOption from '../CommandOption';

const pfp = new Command({
  name: 'pfp',
  description: 'View the profile picture of a user',
  options: [
    new CommandOption({
      name: 'user',
      description:
        'The target user (leave blank to view your own profile picture)',
      required: false,
      type: Discord.CommandOptionType.USER,
    }),
  ],
  handler: async ctx => {
    let targetUserId = ctx.getArgument<string>('user') as string;
    if (!targetUserId) {
      // With the `user` argument is omitted, get the executor's profile picture.
      targetUserId = ctx.interaction.member?.user?.id ?? '';
      if (!targetUserId) {
        return ctx.respondWithError('Unable to identify user.');
      }
    }

    const user = await ctx.api.getUser(targetUserId);
    let url: string;
    // Info on image urls at https://discord.com/developers/docs/reference#image-formatting.
    if (user.avatar !== null) {
      url = `https://cdn.discordapp.com/avatars/${targetUserId}/${user.avatar}.png?size=4096`;
    } else {
      url = `https://cdn.discordapp.com/embed/avatars/${
        Number(user.discriminator) % 5
      }.png?size=4096`;
    }

    return ctx.respondWithEmbed({
      type: Discord.EmbedType.RICH,
      title: `${user.username}'s Profile Picture:`,
      image: { url },
    });
  },
});

export default pfp;
