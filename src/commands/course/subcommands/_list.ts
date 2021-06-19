import SubCommand from '../../../SubCommand';
import { scanCourses } from '../_common';

export const list = new SubCommand({
  name: 'list',
  displayName: 'List Courses',
  description: 'Lists all available courses',
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();

    let coursesList = 'Here is a list of courses: \n';
    coursesList += '```';

    const courses = (await scanCourses(ctx, guildId)).sort({ _id: 1 });

    let nextCourse = await courses.next();
    while (nextCourse !== null) {
      coursesList += `${nextCourse._id} - ${nextCourse.name}: ${nextCourse.description} \n`;
      nextCourse = await courses.next();
    }

    coursesList += '```';

    await ctx.respondSilently(coursesList);
  },
});
