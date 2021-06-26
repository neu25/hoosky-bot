import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { semiBoldCourse, scanCourses } from '../_common';
import { fancyCenter } from '../../../format';

type SubjectGroup = {
  subject: string;
  heading: string;
  list: string;
};

const listAll = new SubCommand({
  name: 'list-all',
  displayName: 'List All Courses',
  description: 'Lists all available courses',
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const courses = (await scanCourses(ctx, guildId)).sort({ _id: 1 });

    // Hold an array of subject groups to output.
    const subGroups: SubjectGroup[] = [];
    // Record the current subject being written to.
    let curGroup: SubjectGroup | null = null;

    // Iterate over every course.
    let c = await courses.next();
    while (c !== null) {
      // If the course's subject is different, then create a new subject group.
      if (!curGroup || c.subject !== curGroup.subject) {
        curGroup = {
          subject: c.subject,
          heading: fancyCenter(c.subject, 50),
          list: '',
        };
        subGroups.push(curGroup);
      }

      // Write the course to the subject group.

      curGroup.list += semiBoldCourse(c) + '\n';
      c = await courses.next();
    }

    // Map subject groups to Discord embed fields.
    const fields: Discord.EmbedField[] = subGroups.map(sub => ({
      name: sub.heading, // The subject name.
      value: sub.list, // The course list.
    }));

    await ctx.respondSilentlyWithEmbed({
      type: Discord.EmbedType.RICH,
      title: 'Course List',
      fields,
    });
  },
});

export default listAll;
