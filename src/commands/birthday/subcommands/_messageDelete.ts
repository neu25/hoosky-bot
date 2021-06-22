import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { deleteBirthdayMessage } from '../_common';
import { bold } from '../../../format';

export const messageDelete = new SubCommand({
  name: 'message-delete',
  displayName: 'Delete Birthday Message',
  description: 'Delete a birthday message',
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
    // TODO: store each message with an ID, remove messages by ID vs text

    const guildId = ctx.mustGetGuildId();
    const message = ctx.getArgument<string>('message') as string;

    await deleteBirthdayMessage(ctx, guildId, message);

    return ctx.respondWithMessage(
      `${bold('Birthday message deleted')}:\n${message}`,
    );
  },
});

export default messageDelete;
