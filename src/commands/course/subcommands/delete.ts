import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { boldCourse } from '../_common';

const del = new SubCommand({
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
    const roleId = ctx.getArgument<string>('role')!;
    const course = await ctx.courses().getByRoleId(guildId, roleId);

    if (!course) {
      return ctx.interactionApi.respondWithError('That course does not exist');
    }

    await ctx.api.deleteGuildRole(guildId, course.roleId);
    await ctx.courses().deleteByRoleId(guildId, course.roleId);

    return ctx.interactionApi.respondWithMessage(
      `Deleted course ${boldCourse(course)}`,
    );
  },
});

export default del;
