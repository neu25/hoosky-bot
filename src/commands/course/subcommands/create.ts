import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { boldCourse, parseCourse, validCourseCode } from '../_common';
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
      name: 'code',
      description: 'The course code (e.g., ENGW 1111)',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();

    const courseName = ctx.getArgument<string>('name')!.trim();
    const courseCode = ctx.getArgument<string>('code')!.trim();

    if (!validCourseCode(courseCode)) {
      return ctx.interactionApi.respondWithError('Invalid course code.');
    }
    if (await ctx.courses().existsByCode(guildId, courseCode)) {
      return ctx.interactionApi.respondWithError('Course already exists.');
    }

    // Create the course role.
    const courseRole = await ctx.api.createGuildRole(guildId, {
      name: courseCode,
      permissions: '0',
      mentionable: true,
    });

    const { subject } = parseCourse(courseCode);
    const course: Course = {
      _id: courseRole.id,
      code: courseCode,
      subject,
      name: courseName,
      roleId: courseRole.id,
      members: [],
      sections: {},
    };
    // Create course in database.
    await ctx.courses().create(guildId, course);

    // Notify of successful course creation.
    return ctx.interactionApi.respondWithMessage(
      `Created role for course ${boldCourse(course)}`,
    );
  },
});

export default create;
