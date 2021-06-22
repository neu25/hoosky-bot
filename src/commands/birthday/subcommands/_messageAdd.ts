import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { Config, BirthdaysConfig } from '../../../database';
import { bold } from '../../../format';

export const messageAdd = new SubCommand({
  name: 'message-add',
  displayName: 'Add Birthday Message',
  description:
    'Add a new birthday message. Use an `@` placeholder to mention the user(s)',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  options: [
    new CommandOption({
      name: 'message',
      description: 'Birthday message',
      required: true,
      type: CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const message = ctx.getArgument<string>('message') as string;

    // Ensure message includes one "@"
    if (!message.includes('@') || (message.match(/@/g) || []).length > 1) {
      return ctx.respondWithError(
        'Invalid message. Make sure to include one `@`.',
      );
    }

    // Get birthdays config.
    const birthdaysCfg = await ctx.db.getConfigValue<BirthdaysConfig>(
      guildId,
      Config.BIRTHDAYS,
    );

    if (birthdaysCfg) {
      // Add message.
      birthdaysCfg.messages?.push(message);

      // Update database.
      await ctx.db.updateConfigValue(guildId, Config.BIRTHDAYS, birthdaysCfg);

      return ctx.respondWithMessage(
        `${bold('Birthday message added')}:\n${message}`,
      );
    }
  },
});

export default messageAdd;
