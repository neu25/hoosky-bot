import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import {
  courseExists,
  getCourse,
  addUserToCourse,
  getCourseMembers,
} from '../_common';

export const join = new SubCommand({
  name: 'join',
  displayName: 'Join Course',
  description: 'Joins a course',
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
    const roleId = ctx.getArgument<Discord.CommandOptionType.ROLE>(
      'role',
    ) as unknown as string;
    if (!(await courseExists(ctx, guildId, roleId))) {
      ctx.respondWithError(`That course does not exist`);
    } else {
      const userId = ctx.interaction.member?.user?.id;

      if (userId) {
        if (
          !(await (
            await getCourseMembers(ctx, guildId, roleId)
          ).includes(userId))
        ) {
          await ctx.api.addRoleToMember(guildId, userId, roleId);

          await addUserToCourse(ctx, guildId, userId, roleId);

          const course = await getCourse(ctx, guildId, roleId);

          // Notify of successful course creation
          return ctx.respondWithMessage(
            `Joined course **${course.crn} - ${course.name}**`,
          );
        } else {
          ctx.respondWithError(`You are already in that course`);
        }
      }
    }
  },
});
