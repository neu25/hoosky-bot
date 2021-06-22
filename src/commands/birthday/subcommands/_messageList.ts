import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { getBirthdaysConfig } from '../_common';

export const messageList = new SubCommand({
  name: 'message-list',
  displayName: 'List Birthday Messages',
  description: 'List all server birthday messages',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const messages = await (await getBirthdaysConfig(ctx, guildId)).messages;

    let description = '';
    messages.map(m => {
      description += m + '\n';
    });

    await ctx.respondSilentlyWithEmbed({
      type: Discord.EmbedType.RICH,
      title: 'All Birthday Messages',
      description,
    });
  },
});

export default messageList;
