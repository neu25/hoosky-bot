import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { boldCourse, Course, courseExists, createCourse } from '../_common';

export const create = new SubCommand({
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

    const name = ctx.getArgument<string>('name')?.trim() as string;
    const id = ctx.getArgument<string>('id')?.trim() as string;

    if (!/^[A-Z]{2,4} [0-9]{4}$/.test(id)) {
      return ctx.respondWithError('Invalid course ID');
    }

    // Extract the subject code. E.g., `ENGW 1111` -> `ENGW`.
    const subject = id.split(' ')[0];
    const number = parseInt(id.split(' ')[1]);

    if (await courseExists(ctx, guildId, id)) {
      return ctx.respondWithError('That course already exists');
    }

    const roleParams = {
      name: id,
      permissions: '0',
      mentionable: true,
    };

    // Create the course role.
    const courseRole = await ctx.api.createGuildRole(guildId, roleParams);
    const course: Course = {
      _id: id,
      subject,
      number,
      name,
      roleId: courseRole.id,
      members: [],
    };

    // Create course in database.
    await createCourse(ctx, guildId, course);

    // Notify of successful course creation.
    return ctx.respondWithMessage(
      `Created role for course ${boldCourse(course)}`,
    );
  },
});
