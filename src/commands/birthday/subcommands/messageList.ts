import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { Config } from '../../../database';
import { BirthdaysConfig } from '../../../repository';

export const messageList = new SubCommand({
  name: 'message-list',
  displayName: 'List Birthday Messages',
  description: 'List server birthday messages',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const birthdaysCfg = await ctx
      .config()
      .get<BirthdaysConfig>(guildId, Config.BIRTHDAYS);

    if (birthdaysCfg && birthdaysCfg.messages) {
      let description = '';
      birthdaysCfg.messages.map(m => {
        description += `\`${m.id}\`: ${m.message}\n`;
      });

      await ctx.interactionApi.respondSilentlyWithEmbed({
        type: Discord.EmbedType.RICH,
        title: 'Birthday Messages',
        description,
        footer: {
          text: '`%` characters are placeholders - they’ll be automatically replaced to tag the birthday person when sent.',
        },
      });
    }
  },
});

export default messageList;
