import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { courseNumberExists, createCourse } from '../_common';

export const create = new SubCommand({
  name: 'create',
  displayName: 'New Course',
  description: 'Creates a new course role',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  options: [
    new CommandOption({
      name: 'name',
      description: 'The course name (eg First Year Writing)',
      required: true,
      type: CommandOptionType.STRING,
    }),
    new CommandOption({
      name: 'number',
      description: 'The course number (eg ENGW 1111)',
      required: true,
      type: CommandOptionType.STRING,
    }),
    new CommandOption({
      name: 'description',
      description: 'The description of the course',
      required: true,
      type: CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const name = ctx.getArgument<string>('name')?.trim() as string;
    const number = ctx.getArgument<string>('number')?.trim() as string;
    const description = ctx.getArgument<string>('description') as string;

    if (await courseNumberExists(ctx, guildId, number)) {
      return ctx.respondWithError(`That course already exists`);
    }

    const roleParams = {
      name: number,
      permissions: '0',
      mentionable: true,
    };

    // Create the course role
    const courseRole = await ctx.api.createGuildRole(guildId, roleParams);
    const roleId = courseRole.id;
    // Create course in database
    const members: string[] = [];
    const courseObj = { _id: number, name, description, roleId, members };
    await createCourse(ctx, guildId, courseObj);

    // Notify of successful course creation
    return ctx.respondWithMessage(
      `Created role for course **${number} - ${name}**`,
    );
  },
});
