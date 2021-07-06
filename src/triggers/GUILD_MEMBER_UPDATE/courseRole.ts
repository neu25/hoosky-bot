import * as Discord from '../../Discord';
import Trigger from '../../Trigger';

/**
 * When a course role is manually removed from a user, remove that user from the
 * course's member list in the database.
 *
 * When a course role is manually added to a user, add that user to the course's
 * member list in the database.
 */
const courseRole = new Trigger({
  event: Discord.Event.GUILD_MEMBER_UPDATE,
  handler: async ctx => {
    const data = ctx.data;
    const { user, guild_id: guildId } = data;
    if (!guildId) {
      throw new Error('No guild ID found in trigger data');
    }

    const courses = await ctx.courses().list(guildId);
    for (const c of courses) {
      if (
        // User IS a member of the course in the database
        c.members.includes(user.id) &&
        // but the user DOESN'T HAVE the course role.
        !data.roles.includes(c.roleId)
      ) {
        // Remove the user from the course in the database.
        // This also removes the user from all sections of that course.
        await ctx.courses().removeMember(guildId, user.id, c.roleId);
      } else if (
        // User IS NOT a member of the course in the database
        !c.members.includes(user.id) &&
        // but the user HAS the course role.
        data.roles.includes(c.roleId)
      ) {
        // Add the user to the course in the database.
        await ctx.courses().addMember(guildId, user.id, c.roleId);
      }
    }
  },
});

export default courseRole;
