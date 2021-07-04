import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { boldCourse } from '../_common';

const leave = new SubCommand({
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

    const course = await ctx.courses().getByRoleId(guildId, roleId);
    if (!course) {
      return ctx.respondWithError('That course does not exist');
    }

    const userId = ctx.mustGetUserId();

    const members = (await ctx.courses().getMembers(guildId, roleId)) ?? [];
    if (!members.includes(userId)) {
      return ctx.respondWithError(`You aren't in that course`);
    }

    await ctx.api.removeRoleFromMember(guildId, userId, roleId);
    await ctx.courses().removeMember(guildId, userId, roleId);

    return ctx.respondWithMessage(`You left the course ${boldCourse(course)}`);
  },
});

export default leave;
