import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { notifyOfUnblock, unblockUserMail } from '../_common';

const unblock = new SubCommand({
  name: 'unblock',
  displayName: 'Mail Unblock User',
  description: 'Unblocks a user from using server mail',
  requiredPermissions: [Discord.Permission.ADMINISTRATOR],
  options: [
    new CommandOption({
      name: 'user',
      description: 'The user to unblock',
      type: Discord.CommandOptionType.USER,
      required: true,
    }),
  ],
  handler: async ctx => {
    const userId = ctx.getArgument<string>('user')!;

    // Update the mail configuration in the database.
    await unblockUserMail(ctx, userId);

    return notifyOfUnblock(ctx, userId);
  },
});

export default unblock;
