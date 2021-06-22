import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
// import CommandOption from '../../../CommandOption';
// import { CommandOptionType } from '../../../Discord';
// import { scanBirthdayMessages } from '../_common';
// import { bold } from '../../../format';

export const messageList = new SubCommand({
  name: 'message-list',
  displayName: 'List Birthday Messages',
  description: 'List all server birthday messages',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  handler: async ctx => {
    // TODO: implement

    // const guildId = ctx.mustGetGuildId();
    // const message = ctx.getArgument<string>('message') as string;

    // await scanBirthdayMessages(ctx, guildId, message);

    return ctx.respondWithError(`This is not yet implemented.`);
  },
});

export default messageList;
