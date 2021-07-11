import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { checkMutePermissionsOrExit, getMuteRoleOrExit } from '../_common';
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
    const targetUserId = ctx.getArgument<string>('user')!;

    if (!(await checkMutePermissionsOrExit(ctx, guildId, targetUserId))) return;

    // Get the muted role.
    const mutedRole = await getMuteRoleOrExit(ctx, guildId);
    if (!mutedRole) return;

    // Give the user the `muted` role.
    try {
      await ctx.api.addRoleToMember(guildId, targetUserId, mutedRole);
    } catch (e) {
      // Error code 50013:	You lack permissions to perform that action.
      if (e.code === 50013) {
        await ctx.interactionApi.respondWithError(
          `Couldn't assign the Muted role. Move HooskBot's role higher.`,
        );
        return;
      }
      // Unknown error.
      throw e;
    }

    // Get info about the user and provide a response message.
    const user = await ctx.api.getUser(targetUserId);
    return ctx.interactionApi.respondWithMessage(
      `Muted ${bold(`${user.username}#${user.discriminator}`)}`,
    );
  },
});

export default add;
