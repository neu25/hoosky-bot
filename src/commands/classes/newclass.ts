import * as Discord from '../../Discord';
import Command from '../../Command';
import SubCommand from '../../SubCommand';
import CommandOption from '../../CommandOption';
import { CommandOptionType } from '../../Discord';
import { dbClass, classExists, createClass } from './_common';

const newclass = new Command({
  name: 'newclass',
  description: 'Create a new class role assignable by users',
  options: [
    new SubCommand({
      name: 'class',
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
        
        const classObj = {name, description};

        if (await classExists(ctx, guildId, name)) {
          ctx.respondWithError(`That class already exists`);
        } else {
          // Create class in database
          createClass(ctx, guildId, classObj);

          const roleParams = {
              name: name,
              permissions: '0',
              mentionable: true,
          }

          // Create the class role
          await ctx.api.createGuildRole(guildId, roleParams);
          


          // Notify of successful class creation
          return ctx.respondWithMessage(
            `Created class **${name}**`,
          );
        }
      },
    }),
  ],
});

export default newclass;
