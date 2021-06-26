import * as Discord from '../../Discord';
import Trigger from '../../Trigger';

/**
 * When a course role is manually removed from a user, remove that user from the
 * course's member list in the database.
 *
 * When a course role is manually added to a user, add that user to the course's
 * member list in the database.
 */
const courseRole = new Trigger<Discord.Event.GUILD_MEMBER_UPDATE>({
  event: Discord.Event.GUILD_MEMBER_UPDATE,
  handler: async ctx => {
    const data = ctx.getData();
    const { user, guild_id: guildId } = data;
    if (!guildId) {
      throw new Error('No guild ID found in trigger data');
    }

    const courses = await ctx.courses().list(guildId);
    for (const c of courses) {
      if (c.members.includes(user.id) && !data.roles.includes(c.roleId)) {
        // If the user is a member of the course but doesn't have the role, remove
        // the course role from the user.
        await ctx.courses().removeMember(guildId, user.id, c.roleId);
      } else if (
        !c.members.includes(user.id) &&
        data.roles.includes(c.roleId)
      ) {
        // If the user has the course role but isn't a member of the course in
        // the database, add the user as a member.
        await ctx.courses().addMember(guildId, user.id, c.roleId);
      }
    }
  },
});

export default courseRole;
