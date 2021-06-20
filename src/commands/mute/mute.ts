import * as Discord from '../../Discord';
import Command from '../../Command';
import SubCommand from '../../SubCommand';
import CommandOption from '../../CommandOption';
import { CommandOptionType } from '../../Discord';
import { checkMutePermissions, mustGetRolesConfig } from './_common';
import { bold } from '../../format';

const mute = new Command({
  name: 'mute',
  description: 'Execute mute commands',
  options: [
    new SubCommand({
      name: 'user',
      displayName: 'Mute',
      description: 'Mutes a user',
      requiredPermissions: [Discord.Permission.KICK_MEMBERS],
      options: [
        new CommandOption({
          name: 'user',
          description: 'The user to mute',
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

        // Give the user the `muted` role.
        await ctx.api.addRoleToMember(guildId, targetUserId, rolesCfg.muted);

        // Get info about the user and provide a response message.
        const user = await ctx.api.getUser(targetUserId);
        return ctx.respondWithMessage(
          `Muted ${bold(`${user.username}#${user.discriminator}`)}`,
        );
      },
    }),
  ],
});

export default mute;
