import SubCommand from '../../../SubCommand';
import { getCourses } from '../_common';

export const list = new SubCommand({
  name: 'list',
  displayName: 'List Courses',
  description: 'Lists all available courses',
  requiredPermissions: [],
  options: [],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    let coursesList = 'Here is a list of courses: \n';
    coursesList += '```';
    const courses = await getCourses(ctx, guildId);
    while (await courses.hasNext()) {
      const nextCourse = await courses.next();
      coursesList += `${nextCourse.crn} - ${nextCourse.name}: ${nextCourse.description} \n`;
    }
    coursesList += '```';
    ctx.respondSilently(coursesList);
  },
});
