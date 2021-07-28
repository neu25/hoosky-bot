import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { bold } from '../../format';

/**
 * When a course role is updated, also update the course in the database.
 */
const courseRole = new Trigger({
  event: Discord.Event.GUILD_ROLE_UPDATE,
  handler: async ctx => {
    const data = ctx.data;
    const { guild_id: guildId } = data;
    if (!guildId) {
      throw new Error('No guild ID found in trigger data');
    }

    const courses = await ctx.courses().list(guildId);

    // Find the course with a matching role ID.
    const matchingCourse = courses.find(c => c.roleId === data.role.id);
    if (!matchingCourse) return;

    // If the role name is unchanged, then we are ok.
    if (matchingCourse.code === data.role.name) return;

    // If the updated role was a course, then also update the database.
    await ctx.courses().updateByRoleId(guildId, matchingCourse.roleId, {
      code: data.role.name,
    });

    return ctx.auditLogger.logMessage({
      title: 'Detected course role rename',
      color: Discord.Color.WARNING,
      description: [
        `I detected that you renamed the role for ${bold(
          matchingCourse.name,
        )} from`,
        bold(matchingCourse.code),
        'to',
        bold(data.role.name) + ',',
        'so I made the corresponding change in the database.',
      ].join(' '),
    });
  },
});

export default courseRole;
