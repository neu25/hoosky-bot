import * as Discord from '../../Discord';
import Command from '../../Command';
import SubCommand from '../../SubCommand';
import CommandOption from '../../CommandOption';
import { CommandOptionType } from '../../Discord';
import {
  courseExists,
  createCourse,
  getCourse,
  addUserToCourse,
  getCourseMembers,
  getCourses,
} from './_common';

export const create = new SubCommand({
    name: 'create',
    displayName: 'New Course',
    description: 'Creates a new course role',
    requiredPermissions: [Discord.Permission.MANAGE_ROLES],
    options: [
      new CommandOption({
        name: 'name',
        description: 'The course name/code',
        required: true,
        type: CommandOptionType.STRING,
      }),
      new CommandOption({
        name: 'description',
        description: 'The description of the course',
        required: true,
        type: CommandOptionType.STRING,
      }),
    ],
    handler: async ctx => {
      const guildId = ctx.mustGetGuildId();
      const name = ctx.getArgument<string>('name')?.trim() as string;
      const description = ctx.getArgument<string>('description') as string;

      if (await courseExists(ctx, guildId, name)) {
        ctx.respondWithError(`That course already exists`);
      } else {
        const roleParams = {
          name: name,
          permissions: '0',
          mentionable: true,
        };

        // Create the course role
        const courseRole = await ctx.api.createGuildRole(guildId, roleParams);
        const roleId = courseRole.id;
        // Create course in database
        const members: string[] = [];
        const courseObj = { name, description, roleId, members };
        createCourse(ctx, guildId, courseObj);

        // Notify of successful course creation
        return ctx.respondWithMessage(`Created role for course **${name}**`);
      }
    },
});