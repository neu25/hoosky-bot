import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { boldCourse } from '../_common';
import AuditLogger from '../../../auditLogger';

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
    const roleId = ctx.getArgument<string>('role')!;

    const course = await ctx.courses().getByRoleId(guildId, roleId);
    if (!course) {
      return ctx.interactionApi.respondWithError('That course does not exist');
    }

    const userId = ctx.mustGetUserId();

    const members = (await ctx.courses().getMembers(guildId, roleId)) ?? [];
    if (!members.includes(userId)) {
      return ctx.interactionApi.respondWithError(`You aren’t in that course`);
    }

    // Let the audit logger know that this leave was intentional, via a command.
    ctx.auditLogger.preventDupe(
      guildId,
      AuditLogger.generateDupeKey({
        guildId,
        action: 'leave_course',
        subjectId: userId,
        objectId: roleId,
      }),
    );

    // `GUILD_MEMBER_UPDATE` trigger will activate and automatically remove the
    // user from the database. Thus, there's no need to do it here.
    await ctx.api.removeRoleFromMember(guildId, userId, roleId);

    return ctx.interactionApi.respondWithMessage(
      `You left the course ${boldCourse(course)}`,
    );
  },
});

export default leave;
