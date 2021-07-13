import * as Discord from '../Discord';
import Command from '../Command';
import CommandOption from '../CommandOption';
import { defaultAvatarUrl, userAvatarUrl } from '../cdn';

const pfp = new Command({
  name: 'pfp',
  displayName: 'Profile Picture',
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
    let targetUserId = ctx.getArgument<string>('user')!;
    if (!targetUserId) {
      // With the `user` argument is omitted, get the executor's profile picture.
      targetUserId = ctx.interaction.member?.user?.id ?? '';
      if (!targetUserId) {
        return ctx.interactionApi.respondWithError('Unable to identify user.');
      }
    }

    const user = await ctx.api.getUser(targetUserId);
    let url: string;
    // Info on image urls at https://discord.com/developers/docs/reference#image-formatting.
    if (user.avatar) {
      url = userAvatarUrl(targetUserId, user.avatar, 4096);
    } else {
      url = defaultAvatarUrl(user.discriminator, 4096);
    }

    return ctx.interactionApi.respondWithEmbed({
      type: Discord.EmbedType.RICH,
      title: `${user.username}’s Profile Picture`,
      image: { url },
    });
  },
});

export default pfp;
