import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { getCourse, deleteCourse } from '../_common';

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
    const roleId = ctx.getArgument<string>('role') as string;
    const course = await getCourse(ctx, guildId, roleId);

    if (!course) {
      return ctx.respondWithError('That course does not exist');
    }

    await ctx.api.deleteGuildRole(guildId, course.roleId);
    await deleteCourse(ctx, guildId, course);

    return ctx.respondWithMessage(
      `Removed course **${course.crn} - ${course.name}**`,
    );
  },
});
