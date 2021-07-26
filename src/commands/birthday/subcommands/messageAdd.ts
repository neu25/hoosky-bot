import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { Config } from '../../../database';
import { BirthdaysConfig } from '../../../repository';
import { bold } from '../../../format';

export const messageAdd = new SubCommand({
  name: 'message-add',
  displayName: 'Add Birthday Message',
  description:
    'Add a new birthday message. Use a “%” placeholder to mention the user(s)',
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
    const message = ctx.getArgument<string>('message')!;

    // Ensure message includes one "%"
    if (!message.includes('%') || (message.match(/%/g) || []).length > 1) {
      return ctx.interactionApi.respondWithError(
        'Invalid message. Make sure to include one `%`.',
      );
    }

    // Get birthdays config.
    const birthdaysCfg = await ctx
      .config()
      .get<BirthdaysConfig>(guildId, Config.BIRTHDAYS);
    if (!birthdaysCfg) {
      return ctx.interactionApi.respondWithError(
        `Unable to fetch birthdays config`,
      );
    }

    const messages = birthdaysCfg.messages;
    let nextId = 1;
    if (messages) {
      nextId = messages[messages.length - 1].id + 1;

      // Ensure all IDs are positive values
      if (nextId < 1) {
        nextId = 1;
      }
    }

    // Add message.
    birthdaysCfg.messages?.push({ id: nextId, message });

    // Update database.
    await ctx.config().update(guildId, Config.BIRTHDAYS, birthdaysCfg);

    return ctx.interactionApi.respondWithMessage(
      `${bold('Birthday message added:')}\n${message}`,
    );
  },
});

export default messageAdd;
