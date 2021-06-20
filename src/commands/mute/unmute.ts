import Command from '../../Command';
import SubCommand from '../../SubCommand';
import CommandOption from '../../CommandOption';
import { CommandOptionType } from '../../Discord';
import * as Discord from '../../Discord';
import { checkMutePermissions, mustGetRolesConfig } from './_common';
import { bold } from '../../format';

const unmute = new Command({
  name: 'unmute',
  description: 'Execute unmute commands',
  options: [
    new SubCommand({
      name: 'user',
      displayName: 'Unmute',
      description: 'Unmutes a user',
      requiredPermissions: [Discord.Permission.KICK_MEMBERS],
      options: [
        new CommandOption({
          name: 'user',
          description: 'The user to unmute',
          required: true,
          type: CommandOptionType.USER,
        }),
      ],
      handler: async ctx => {
        const guildId = ctx.mustGetGuildId();
        const targetUserId = ctx.getArgument<string>('user') as string;

        if (!(await checkMutePermissions(ctx, guildId, targetUserId))) return;

        // Get the muted role.
        const rolesCfg = await mustGetRolesConfig(ctx, guildId);

        // Remove the `muted` role from the user.
        await ctx.api.removeRoleFromMember(
          guildId,
          targetUserId,
          rolesCfg.muted,
        );

        // Get info about the user and provide a response message.
        const user = await ctx.api.getUser(targetUserId);
        return ctx.respondWithMessage(
          `Unmuted ${bold(`${user.username}#${user.discriminator}`)}`,
        );
      },
    }),
  ],
});

export default unmute;
