import * as Discord from '../../Discord';
import Command from '../../Command';
import SubCommand from '../../SubCommand';
import CommandOption from '../../CommandOption';
import { CommandOptionType } from '../../Discord';
import {
    courseExists,
    createCourse,
    getCourse,
    addUserToCourse,
    getCourseMembers,
    getCourses,
} from './_common';

export const roster = new SubCommand({
    name: 'roster',
    displayName: 'Returns a roster of members in a course',
    description: 'Returns a roster of members in a course',
    requiredPermissions: [],
    options: [
      new CommandOption({
        name: 'role',
        description: 'The course role',
        required: true,
        type: CommandOptionType.ROLE,
      }),
    ],
    handler: async ctx => {
      const guildId = ctx.mustGetGuildId();
      const roleId = ctx.getArgument<Discord.CommandOptionType.ROLE>('role') as unknown as string;
      if (!(await courseExists(ctx, guildId, roleId))) {
        ctx.respondWithError(`That course does not exist`);
      } else {
        const guildId = ctx.mustGetGuildId();
        const course = await getCourse(ctx, guildId, roleId);
        const members = await getCourseMembers(ctx, guildId, roleId);

        let membersList = `Here is a list of all ${members.length} members in **${course.crn} - ${course.name}**: \n`;
        
        for (let i = 0; i < members.length; i++) {
          membersList += `<@${members[i]}> \n`;
        }

        ctx.respondSilently(membersList);
      }
    },
});