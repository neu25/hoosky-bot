import * as Discord from '../../Discord';
import Trigger from '../../Trigger';

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

    const courseRoles = await ctx.courses().listRoles(guildId);
    // If the deleted role was a course, then also delete from the database.
    if (courseRoles.includes(data.role_id)) {
      await ctx.courses().deleteByRoleId(guildId, data.role_id);
    }
  },
});

export default courseRole;
