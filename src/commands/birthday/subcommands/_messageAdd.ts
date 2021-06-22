import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { addBirthdayMessage } from '../_common';
import { bold } from '../../../format';

export const messageAdd = new SubCommand({
  name: 'message-add',
  displayName: 'Add Birthday Message',
  description:
    'Add a new birthday message. Use an `@` placeholder to mention the user',
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

    await addBirthdayMessage(ctx, guildId, message);

    return ctx.respondWithMessage(
      `${bold('Birthday message added')}:\n${message}`,
    );
  },
});

export default messageAdd;
