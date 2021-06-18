import * as Discord from '../../Discord';
import Command from '../../Command';
import SubCommand from '../../SubCommand';
import CommandOption from '../../CommandOption';
import { CommandOptionType } from '../../Discord';
import {
  courseExists,
  createCourse,
  getRole,
  addUserToCourse,
  getCourseMembers,
  getCourses,
} from './_common';

const course = new Command({
  name: 'course',
  description: 'Manage server courses',
  options: [
    new SubCommand({
      name: 'create',
      displayName: 'New Course',
      description: 'Creates a new course role',
      requiredPermissions: [Discord.Permission.MANAGE_ROLES],
      options: [
        new CommandOption({
          name: 'name',
          description: 'The course name/code',
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
        const description = ctx.getArgument<string>('description') as string;

        if (await courseExists(ctx, guildId, name)) {
          ctx.respondWithError(`That course already exists`);
        } else {
          const roleParams = {
            name: name,
            permissions: '0',
            mentionable: true,
          };

          // Create the course role
          const courseRole = await ctx.api.createGuildRole(guildId, roleParams);
          const id = courseRole.id;
          // Create course in database
          const members: string[] = [];
          const courseObj = { name, description, id, members };
          createCourse(ctx, guildId, courseObj);

          // Notify of successful course creation
          return ctx.respondWithMessage(`Created role for course **${name}**`);
        }
      },
    }),
    new SubCommand({
      name: 'join',
      displayName: 'Join Course',
      description: 'Joins a course',
      requiredPermissions: [],
      options: [
        new CommandOption({
          name: 'name',
          description: 'The course name/code',
          required: true,
          type: CommandOptionType.STRING,
        }),
      ],
      handler: async ctx => {
        const guildId = ctx.mustGetGuildId();
        const name = ctx.getArgument<string>('name')?.trim() as string;
        if (!(await courseExists(ctx, guildId, name))) {
          ctx.respondWithError(`That course does not exist`);
        } else {
          // Get the course role
          const courseRole = await getRole(ctx, guildId, name);
          const roleId = courseRole.id;
          const userId = ctx.interaction.member?.user?.id;

          if (userId) {
            if (
              !(await (
                await getCourseMembers(ctx, guildId, name)
              ).includes(userId))
            ) {
              await ctx.api.addRoleToMember(guildId, userId, roleId);

              await addUserToCourse(ctx, guildId, userId, name);

              // Notify of successful course creation
              return ctx.respondWithMessage(`Joined course **${name}**`);
            } else {
              ctx.respondWithError(`You are already in that course`);
            }
          }
        }
      },
    }),
    new SubCommand({
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
          coursesList += `${nextCourse.name} - ${nextCourse.description} \n`;
        }
        coursesList += '```';
        ctx.respondSilently(coursesList);
      },
    }),
    new SubCommand({
      name: 'roster',
      displayName: 'Returns a roster of members in a course',
      description: 'Returns a roster of members in a course',
      requiredPermissions: [],
      options: [
        new CommandOption({
          name: 'name',
          description: 'The course name/code',
          required: true,
          type: CommandOptionType.STRING,
        }),
      ],
      handler: async ctx => {
        const guildId = ctx.mustGetGuildId();
        const name = ctx.getArgument<string>('name')?.trim() as string;
        if (!(await courseExists(ctx, guildId, name))) {
          ctx.respondWithError(`That course does not exist`);
        } else {
          const guildId = ctx.mustGetGuildId();
          let membersList = `Here is a list of members in ${name}: \n`;

          const members = await getCourseMembers(ctx, guildId, name);
          for (let i = 0; i < members.length; i++) {
            membersList += `<@${members[i]}> \n`;
          }

          ctx.respondSilently(membersList);
        }
      },
    }),
  ],
});

export default course;
