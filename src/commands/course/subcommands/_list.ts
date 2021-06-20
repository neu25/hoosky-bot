import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { semiBoldCourse, scanCourses } from '../_common';
import { fancyCenter } from '../../../format';

type SubjectGroup = {
  subject: string;
  heading: string;
  list: string;
};

export const list = new SubCommand({
  name: 'list',
  displayName: 'List Courses',
  description: 'Lists all available courses',
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const courses = (await scanCourses(ctx, guildId)).sort({ _id: 1 });

    // `subGroups` stores a map of subjects and course lists.
    // E.g., { 'CS': 'CS 2500\n CS 2501', ... }
    const subGroups: Record<string, SubjectGroup> = {};

    let c = await courses.next();
    while (c !== null) {
      if (!subGroups[c.subject]) {
        subGroups[c.subject] = {
          subject: c.subject,
          heading: fancyCenter(c.subject, 50),
          list: '',
        };
      }

      subGroups[c.subject].list += semiBoldCourse(c) + '\n';
      c = await courses.next();
    }

    const subArray = Object.values(subGroups).sort((g1, g2) =>
      g1.subject.localeCompare(g2.subject),
    );

    // Map subject groups to Discord embed fields.
    const fields: Discord.EmbedField[] = subArray.map(sub => ({
      name: sub.heading, // The subject name.
      value: sub.list, // The course list.
    }));

    await ctx.respondWithEmbed(
      {
        type: Discord.EmbedType.RICH,
        title: 'Course List',
        fields,
      },
      true,
    );
  },
});
