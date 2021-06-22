import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { Config, BirthdaysConfig } from '../../../database';

export const messageList = new SubCommand({
  name: 'message-list',
  displayName: 'List Birthday Messages',
  description: 'List all server birthday messages',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const birthdaysCfg = await ctx.db.getConfigValue<BirthdaysConfig>(
      guildId,
      Config.BIRTHDAYS,
    );

    if (birthdaysCfg && birthdaysCfg.messages) {
      let description = '';
      birthdaysCfg.messages.map(m => {
        description += m + '\n';
      });

      await ctx.respondSilentlyWithEmbed({
        type: Discord.EmbedType.RICH,
        title: 'All Birthday Messages',
        description,
      });
    }
  },
});

export default messageList;
