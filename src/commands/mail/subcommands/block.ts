import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { blockUserMail, notifyOfBlock } from '../_common';

const block = new SubCommand({
  name: 'block',
  displayName: 'Mail Block User',
  description: 'Blocks a user from using server mail',
  requiredPermissions: [Discord.Permission.ADMINISTRATOR],
  options: [
    new CommandOption({
      name: 'user',
      description: 'The user to block',
      type: Discord.CommandOptionType.USER,
      required: true,
    }),
  ],
  handler: async ctx => {
    const userId = ctx.getArgument<string>('user')!;

    // Update the mail configuration in the database.
    await blockUserMail(ctx, userId);

    return notifyOfBlock(ctx, userId);
  },
});

export default block;
