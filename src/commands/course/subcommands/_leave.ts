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
  getCourses,
  removeUserFromCourse
} from '../_common';

export const leave = new SubCommand({
    name: 'leave',
    displayName: 'Leave Course',
    description: 'Leaves a course',
    requiredPermissions: [],
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
        const userId = ctx.interaction.member?.user?.id;

        if (userId) {
          if (
            (await (
              await getCourseMembers(ctx, guildId, roleId)
            ).includes(userId))
          ) {
            await ctx.api.removeRoleFromMember(guildId, userId, roleId);

            await removeUserFromCourse(ctx, guildId, userId, roleId);

            const course = await getCourse(ctx, guildId, roleId);

            // Notify of successful course creation
            return ctx.respondWithMessage(`Left course **${course.crn} - ${course.name}**`);
          } else {
            ctx.respondWithError(`You aren't in that course`);
          }
        }
      }
    },
});