import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { checkMutePermissions, mustGetRolesConfig } from '../_common';
import { bold } from '../../../format';

const add = new SubCommand({
  name: 'add',
  displayName: 'Add Mute',
  description: 'Mutes a user',
  requiredPermissions: [Discord.Permission.KICK_MEMBERS],
  options: [
    new CommandOption({
      name: 'user',
      description: 'The user to mute',
      required: true,
      type: Discord.CommandOptionType.USER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const targetUserId = ctx.getArgument<string>('user') as string;

    if (!(await checkMutePermissions(ctx, guildId, targetUserId))) return;

    // Get the muted role.
    const rolesCfg = await mustGetRolesConfig(ctx, guildId);
    if (!rolesCfg.muted) {
      return ctx.respondWithError(
        'Muted role not set up yet. Try running `/mute setup`.',
      );
    }

    // Give the user the `muted` role.
    await ctx.api.addRoleToMember(guildId, targetUserId, rolesCfg.muted);

    // Get info about the user and provide a response message.
    const user = await ctx.api.getUser(targetUserId);
    return ctx.respondWithMessage(
      `Muted ${bold(`${user.username}#${user.discriminator}`)}`,
    );
  },
});

export default add;
