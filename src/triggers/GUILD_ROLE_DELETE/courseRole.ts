import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { bold } from '../../format';
import AuditLogger from '../../auditLogger';

/**
 * When a course role is deleted, also delete the course in the database.
 */
const courseRole = new Trigger({
  event: Discord.Event.GUILD_ROLE_DELETE,
  handler: async ctx => {
    const data = ctx.data;
    const { guild_id: guildId } = data;
    if (!guildId) {
      throw new Error('No guild ID found in trigger data');
    }

    const courses = await ctx.courses().list(guildId);

    // Find the course with a matching role ID.
    const matchingCourse = courses.find(c => c.roleId === data.role_id);
    if (!matchingCourse) return;

    // If the deleted role was a course, then also delete from the database.
    await ctx.courses().deleteByRoleId(guildId, data.role_id);

    return ctx.auditLogger.logMessage(
      {
        title: 'Detected course role deletion',
        color: Discord.Color.WARNING,
        description: [
          `I detected that you deleted the role for ${bold(
            matchingCourse.code,
          )},`,
          'so I made the corresponding deletion in the database.',
        ].join(' '),
      },
      AuditLogger.generateDupeKey({
        guildId,
        action: 'delete_course',
        objectId: data.role_id,
      }),
    );
  },
});

export default courseRole;
