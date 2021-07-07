import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { boldCourse, parseCourse, validCourseId } from '../_common';
import { Course } from '../../../repository';

const create = new SubCommand({
  name: 'create',
  displayName: 'New Course',
  description: 'Creates a new course role',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  options: [
    new CommandOption({
      name: 'name',
      description: 'The course name (e.g., First-Year Writing)',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
    new CommandOption({
      name: 'id',
      description: 'The course ID (e.g., ENGW 1111)',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();

    const courseName = ctx.getArgument<string>('name')?.trim() as string;
    const courseId = ctx.getArgument<string>('id')?.trim() as string;

    if (!validCourseId(courseId)) {
      return ctx.respondWithError('Invalid course ID.');
    }
    if (await ctx.courses().exists(guildId, courseId)) {
      return ctx.respondWithError('Course already exists.');
    }

    // Create the course role.
    const courseRole = await ctx.api.createGuildRole(guildId, {
      name: courseId,
      permissions: '0',
      mentionable: true,
    });

    const { subject, number } = parseCourse(courseId);
    const course: Course = {
      _id: courseId,
      subject,
      number,
      name: courseName,
      roleId: courseRole.id,
      members: [],
      sections: {},
    };
    // Create course in database.
    await ctx.courses().create(guildId, course);

    // Notify of successful course creation.
    return ctx.respondWithMessage(
      `Created role for course ${boldCourse(course)}`,
    );
  },
});

export default create;
