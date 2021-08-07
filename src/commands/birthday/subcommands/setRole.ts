import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { Config } from '../../../database';
import { bold } from '../../../format';
import { RolesConfig } from '../../../repository';

const setRole = new SubCommand({
  name: 'set-role',
  displayName: 'Set Up Birthday Role',
  description: 'Set up birthday role',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  options: [
    new CommandOption({
      name: 'role',
      description: 'Birthday role',
      required: true,
      type: CommandOptionType.ROLE,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const roleId = ctx.getArgument<string>('role')!;

    // Fetch the role configuration from the database.
    const rolesCfg = await ctx.config().get<RolesConfig>(guildId, Config.ROLES);
    if (!rolesCfg) {
      return ctx.interactionApi.respondWithError(
        `Unable to fetch roles config`,
      );
    }

    // Update the birthday role configuration value.
    rolesCfg.birthday = roleId;

    // Update database.
    await ctx.config().update(guildId, Config.ROLES, rolesCfg);

    return ctx.interactionApi.respondWithMessage(
      `${bold('Birthday role updated')} to <@${roleId}>`,
    );
  },
});

export default setRole;
