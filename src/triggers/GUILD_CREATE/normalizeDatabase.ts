import _ from 'lodash';
import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { Birthday, Course } from '../../repository';
import { eliminateDuplicates } from '../../utils';

/**
 * Resolves data integrity issues of the given birthday.
 *
 * @param b The birthday to fix.
 */
const normalizeBirthday = (b: Birthday): Birthday => {
  let { users } = b;
  users = users ?? [];

  // Eliminate duplicate users in birthdays.
  users = eliminateDuplicates(users);

  return {
    _id: b._id,
    users,
  };
};

/**
 * Resolves data integrity issues of the given course.
 *
 * @param c The course to fix.
 */
const normalizeCourse = (c: Course): Course => {
  let { members, sections } = c;
  members = members ?? [];
  sections = sections ?? {};

  // Eliminate duplicate users in course members.
  members = eliminateDuplicates(members);

  // Eliminate duplicate users in course sections.
  for (const sec of Object.values(sections)) {
    sec.members = eliminateDuplicates(sec.members);
  }

  return {
    _id: c._id,
    code: c.code,
    subject: c.subject,
    name: c.name,
    roleId: c.roleId,
    members,
    sections,
  };
};

/**
 * Normalize the database for every guild. This allows us to perform schema migrations.
 */
const normalizeDatabase = new Trigger({
  event: Discord.Event.GUILD_CREATE,
  handler: async ctx => {
    const guild = ctx.data;

    console.log(`Normalizing database of ${guild.name} (${guild.id})...`);

    const courses = await ctx.courses().list(guild.id);
    for (const c of courses) {
      const n = normalizeCourse(c);
      // If the course changed, then update it.
      if (!_.isEqual(c, n)) {
        console.log(`Corruption in course ${c._id} (${c.code}). Fixing...`);
        await ctx.courses().updateByRoleId(guild.id, c.roleId, n);
      }
    }

    const birthdays = await ctx.birthdays().list(guild.id);
    for (const b of birthdays) {
      const n = normalizeBirthday(b);
      // If the birthday changed, then update it.
      if (!_.isEqual(b, n)) {
        console.log(`Corruption in birthday ${b._id}. Fixing...`);
        await ctx.birthdays().updateById(guild.id, b._id, n);
      }
    }

    console.log('Database normalization completed');
  },
});

export default normalizeDatabase;
