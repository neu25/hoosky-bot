import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';

const remove = new SubCommand({
  name: 'remove',
  displayName: 'Remove Pin',
  description: 'Unpin a message',
  options: [
    new CommandOption({
      name: 'link',
      description:
        'Hover over the message, click `⋯`, click `Copy Message Link`',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const link = ctx.getArgument<string>('link')!;

    // Parse message link
    const ids = link.substr(link.indexOf('/channels/') + 10).split('/');
    console.log(link, ids);
    const channelId = ids[1];
    const messageId = ids[2];

    // Unpin message
    await ctx.api.unpinMessage(channelId, messageId);

    // Post silent confirmation
    return ctx.interactionApi.respondSilently('Message unpinned!');
  },
});

export default remove;
