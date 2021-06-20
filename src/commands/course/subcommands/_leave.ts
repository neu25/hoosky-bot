import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import {
  getCourse,
  getCourseMembers,
  removeUserFromCourse,
  boldCourse,
} from '../_common';

export const leave = new SubCommand({
  name: 'leave',
  displayName: 'Leave Course',
  description: 'Leaves a course',
  options: [
    new CommandOption({
      name: 'role',
      description: 'The course role',
      required: true,
      type: Discord.CommandOptionType.ROLE,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const roleId = ctx.getArgument<string>('role') as string;

    const course = await getCourse(ctx, guildId, roleId);
    if (!course) {
      return ctx.respondWithError('That course does not exist');
    }

    const userId = ctx.interaction.member?.user?.id;
    if (!userId) {
      return ctx.respondWithError('Unable to identify you');
    }

    const courseMembers = (await getCourseMembers(ctx, guildId, roleId)) ?? [];
    if (!courseMembers.includes(userId)) {
      return ctx.respondWithError(`You aren't in that course`);
    }

    await ctx.api.removeRoleFromMember(guildId, userId, roleId);
    await removeUserFromCourse(ctx, guildId, userId, roleId);

    return ctx.respondWithMessage(`You left the course ${boldCourse(course)}`);
  },
});
