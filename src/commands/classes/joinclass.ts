import * as Discord from '../../Discord';
import Command from '../../Command';
import SubCommand from '../../SubCommand';
import CommandOption from '../../CommandOption';
import { CommandOptionType } from '../../Discord';
import { dbClass, classExists, createClass, getRole } from './_common';

const joinclass = new Command({
  name: 'joinclass',
  description: 'Assign yourself a class role to join the class',
  options: [
    new SubCommand({
      name: 'class',
      displayName: 'Join Class',
      description: 'Joins a class',
      requiredPermissions: [Discord.Permission.MANAGE_ROLES],
      options: [
        new CommandOption({
          name: 'name',
          description: 'The class name/code',
          required: true,
          type: CommandOptionType.STRING,
        }),
      ],
      handler: async ctx => {
        const guildId = ctx.mustGetGuildId();
        const name = ctx.getArgument<string>('name')?.trim() as string;
        if (!await classExists(ctx, guildId, name)) {
          ctx.respondWithError(`That class does not exist`);
        } else {
            // Get the class role
            const classRole = await getRole(ctx, guildId, name);
            const roleId = classRole.id;
            const userId = ctx.interaction.member?.user?.id;
            
            if (userId) {
                await ctx.api.addRoleToMember(guildId, userId, roleId);

                // Notify of successful class creation
                return ctx.respondWithMessage(
                `Joined class **${name}**`,
                );
            }
        }
      },
    }),
  ],
});

export default joinclass;
