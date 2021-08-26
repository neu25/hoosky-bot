import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';

const add = new SubCommand({
  name: 'add',
  displayName: 'Add Pin',
  description: 'Pin a message',
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

    // Pin message
    await ctx.api.pinMessage(channelId, messageId);

    // Post silent confirmation
    return ctx.interactionApi.respondSilently('Message pinned!');
  },
});

export default add;
