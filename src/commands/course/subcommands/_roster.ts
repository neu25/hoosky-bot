import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { getCourse, getCourseMembers, boldCourse } from '../_common';

export const roster = new SubCommand({
  name: 'roster',
  displayName: 'Course Roster',
  description: 'Returns a roster of members in a course',
  options: [
    new CommandOption({
      name: 'role',
      description: 'The course role',
      required: true,
      type: Discord.CommandOptionType.ROLE,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const roleId = ctx.getArgument<string>('role') as string;

    const course = await getCourse(ctx, guildId, roleId);
    if (!course) {
      return ctx.respondWithError('That course does not exist');
    }

    const members = (await getCourseMembers(ctx, guildId, roleId)) ?? [];
    if (members.length === 0) {
      return ctx.respondSilently(
        `There are no members in ${boldCourse(course)}`,
      );
    }

    let memberList = '';
    for (let i = 0; i < members.length; i++) {
      memberList += `${i + 1}. <@${members[i]}>\n`;
    }

    return ctx.respondWithEmbed(
      {
        type: Discord.EmbedType.RICH,
        title: `Members in ${boldCourse(course)}`,
        description: memberList,
      },
      true,
    );
  },
});
