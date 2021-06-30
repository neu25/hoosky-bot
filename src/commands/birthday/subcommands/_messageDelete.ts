import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { Config, BirthdaysConfig } from '../../../database';
import { bold } from '../../../format';

export const messageDelete = new SubCommand({
  name: 'message-delete',
  displayName: 'Delete Birthday Message',
  description: 'Delete a birthday message',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  options: [
    new CommandOption({
      name: 'id',
      description: 'Message ID',
      required: true,
      type: CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const providedId = ctx.getArgument<string>('id') as string;
    const id = parseInt(providedId, 10);

    if (!id || typeof id !== 'number') {
      return ctx.respondWithError(`ID is invalid`);
    }

    // Get birthdays config.
    const birthdaysCfg = await ctx.db.getConfigValue<BirthdaysConfig>(
      guildId,
      Config.BIRTHDAYS,
    );

    if (birthdaysCfg && birthdaysCfg.messages) {
      const index = birthdaysCfg.messages
        .map(function (m) {
          return m.id;
        })
        .indexOf(id);

      const message = birthdaysCfg.messages[index].message;

      if (index > -1) {
        // Remove message.
        birthdaysCfg.messages.splice(index, 1);

        // Update database.
        await ctx.db.updateConfigValue(guildId, Config.BIRTHDAYS, birthdaysCfg);

        return ctx.respondWithMessage(
          `${bold('Birthday message deleted')}:\n${message}`,
        );
      }

      return ctx.respondWithError(`Message does not exist:\n${message}`);
    }
  },
});

export default messageDelete;
