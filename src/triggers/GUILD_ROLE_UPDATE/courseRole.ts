import * as Discord from '../../Discord';
import Trigger from '../../Trigger';

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

    const courseRoles = await ctx.courses().listRoles(guildId);
    // If the updated role was a course, then also update the database.
    if (courseRoles.includes(data.role.id)) {
      await ctx.courses().updateByRoleId(guildId, data.role.id, {
        code: data.role.name,
      });
    }
  },
});

export default courseRole;
