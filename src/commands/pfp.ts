import * as Discord from '../Discord';
import Command from '../Command';
import CommandOption from '../CommandOption';
import { EmbedImage } from '../Discord';

const pfp = new Command({
  name: 'pfp',
  description: 'View the profile picture of a user',
  options: [
    new CommandOption({
      name: 'user',
      description: 'The user to get the profile picture of',
      required: true,
      type: Discord.CommandOptionType.USER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const targetUserId = ctx.getArgument<string>('user') as string;

    const user = await ctx.api.getUser(targetUserId);
    let url;
    // Info on image urls at https://discord.com/developers/docs/reference#image-formatting
    if (user.avatar != null) {
        url = `https://cdn.discordapp.com/avatars/${targetUserId}/${user.avatar}.png?size=4096`; 
    } else {
        url = `https://cdn.discordapp.com/embed/avatars/${(Number(user.discriminator)) % 5}.png?size=4096`;
    }
    const image: EmbedImage = { url: url };

    return ctx.respondWithEmbed({
      type: Discord.EmbedType.RICH,
      title: `Here is ${user.username}'s Profile Picture:`,
      image: image,
    });
  },
});

export default pfp;