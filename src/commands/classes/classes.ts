import * as Discord from '../../Discord';
import Command from '../../Command';
import SubCommand from '../../SubCommand';
import CommandOption from '../../CommandOption';
import { CommandOptionType } from '../../Discord';
import { dbClass, classExists, createClass, getRole } from './_common';

const classes = new Command({
  name: 'classes',
  description: 'Manage server classes',
  options: [
    new SubCommand({
      name: 'create',
      displayName: 'New Class',
      description: 'Creates a new class role',
      requiredPermissions: [Discord.Permission.MANAGE_ROLES],
      options: [
        new CommandOption({
          name: 'name',
          description: 'The class name/code',
          required: true,
          type: CommandOptionType.STRING,
        }),
        new CommandOption({
          name: 'description',
          description: 'The description of the class',
          required: true,
          type: CommandOptionType.STRING,
        }),
      ],
      handler: async ctx => {
        const guildId = ctx.mustGetGuildId();
        const name = ctx.getArgument<string>('name')?.trim() as string;
        const description = ctx.getArgument<string>('description') as string;

        if (await classExists(ctx, guildId, name)) {
          ctx.respondWithError(`That class already exists`);
        } else {
          const roleParams = {
              name: name,
              permissions: '0',
              mentionable: true,
          }

          // Create the class role
          const classRole = await ctx.api.createGuildRole(guildId, roleParams);
          const id = classRole.id;
          // Create class in database
          const classObj = {name, description, id};
          createClass(ctx, guildId, classObj);


          // Notify of successful class creation
          return ctx.respondWithMessage(
            `Created role for class **${name}**`,
          );
        }
      },
    }),
    new SubCommand({
      name: 'join',
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

export default classes;
