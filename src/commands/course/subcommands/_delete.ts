import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { getCourseByRoleId, deleteCourse, boldCourse } from '../_common';

export const del = new SubCommand({
  name: 'delete',
  displayName: 'Delete Course',
  description: 'Delete a course role',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
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
    const course = await getCourseByRoleId(ctx, guildId, roleId);

    if (!course) {
      return ctx.respondWithError('That course does not exist');
    }

    await ctx.api.deleteGuildRole(guildId, course.roleId);
    await deleteCourse(ctx, guildId, course);

    return ctx.respondWithMessage(`Deleted course ${boldCourse(course)}`);
  },
});
