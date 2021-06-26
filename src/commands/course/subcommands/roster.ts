import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import {
  getCourseByRoleId,
  getCourseMembers,
  getSectionMembers,
  boldCourse,
} from '../_common';

const roster = new SubCommand({
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
    new CommandOption({
      name: 'section-number',
      description: 'The number of your course section',
      required: false,
      type: Discord.CommandOptionType.INTEGER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const roleId = ctx.getArgument<string>('role') as string;
    const sectionNum = parseInt(
      ctx.getArgument<string>('section-number') as string,
    );
    const sectionPhrase = sectionNum ? `section ${sectionNum} of ` : '';

    const course = await getCourseByRoleId(ctx, guildId, roleId);
    if (!course) {
      return ctx.respondWithError('That course does not exist');
    }

    const members =
      (sectionNum
        ? await getSectionMembers(ctx, guildId, roleId, sectionNum)
        : await getCourseMembers(ctx, guildId, roleId)) ?? [];
    if (members.length === 0) {
      return ctx.respondSilently(
        `There are no members in ${sectionPhrase}${boldCourse(course)}`,
      );
    }

    let memberList = '';
    for (let i = 0; i < members.length; i++) {
      memberList += `${i + 1}. <@${members[i]}>\n`;
    }

    return ctx.respondSilentlyWithEmbed({
      type: Discord.EmbedType.RICH,
      title: `Members in ${sectionPhrase}${boldCourse(course)}`,
      description: memberList,
    });
  },
});

export default roster;
