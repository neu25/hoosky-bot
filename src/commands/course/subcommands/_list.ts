import SubCommand from '../../../SubCommand';
import { scanCourses } from '../_common';

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

    const courses = await scanCourses(ctx, guildId);

    let nextCourse = await courses.next();
    while (nextCourse !== null) {
      coursesList += `${nextCourse.crn} - ${nextCourse.name}: ${nextCourse.description} \n`;
      nextCourse = await courses.next();
    }

    coursesList += '```';

    await ctx.respondSilently(coursesList);
  },
});
