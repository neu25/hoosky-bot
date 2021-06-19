import * as Discord from '../../../Discord';
import Command from '../../../Command';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import {
  courseExists,
  createCourse,
  getCourse,
  addUserToCourse,
  getCourseMembers,
  getCourses,
} from '../_common';

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
  