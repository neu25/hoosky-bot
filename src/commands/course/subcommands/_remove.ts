import * as Discord from '../../../Discord';
import Command from '../../../Command';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import {
  courseExists,
  createCourse,
  getCourse,
  addUserToCourse,
  getCourseMembers,
  deleteCourse,
} from '../_common';

export const remove = new SubCommand({
    name: 'remove',
    displayName: 'Remove Course',
    description: 'Remove a course role',
    requiredPermissions: [Discord.Permission.MANAGE_ROLES],
    options: [
      new CommandOption({
        name: 'role',
        description: 'The course role',
        required: true,
        type: CommandOptionType.ROLE,
      }),
    ],
    handler: async ctx => {
      const guildId = ctx.mustGetGuildId();
      const roleId = ctx.getArgument<Discord.CommandOptionType.ROLE>('role') as unknown as string;
      if (!(await courseExists(ctx, guildId, roleId))) {
        ctx.respondWithError(`That course does not exist`);
      } else {
        const guildId = ctx.mustGetGuildId();
        const course = await getCourse(ctx, guildId, roleId);
        const members = await getCourseMembers(ctx, guildId, roleId);

        await ctx.api.deleteGuildRole(guildId, course.roleId);
        await deleteCourse(ctx, guildId, course);

        ctx.respondWithMessage(`Removed course **${course.crn} - ${course.name}**`)
      }
    },
});