import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { boldCourse } from '../_common';
import { bold, italics, underline } from '../../../format';

type CourseMember = {
  userId: string;
  sectionNum: number | null;
};

type Roster = Record<string, CourseMember>;

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
      name: 'section',
      description: "The course's section number",
      required: false,
      type: Discord.CommandOptionType.INTEGER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const roleId = ctx.getArgument<string>('role')!;
    const sectionNum = ctx.getArgument<string>('section');
    const sectionPhrase = sectionNum
      ? bold(`Section ${sectionNum}`) + ' of '
      : '';

    const course = await ctx.courses().getByRoleId(guildId, roleId);
    if (!course) {
      return ctx.respondWithError('That course does not exist');
    }

    const roster: Roster = {};
    if (sectionNum) {
      const sectionInt = parseInt(sectionNum);
      const section = await ctx
        .courses()
        .getSection(guildId, roleId, sectionInt);
      if (section) {
        const members = section.members;
        for (const m of members) {
          roster[m] = {
            userId: m,
            sectionNum: sectionInt,
          };
        }
      }
    } else {
      const course = await ctx.courses().getByRoleId(guildId, roleId);
      if (course) {
        // Create a course member for every user ID.
        for (const m of course.members) {
          roster[m] = {
            userId: m,
            sectionNum: null,
          };
        }
        // Populate the course members with their section numbers.
        for (const sec of Object.values(course.sections)) {
          for (const m of sec.members) {
            roster[m] = {
              ...roster[m],
              sectionNum: sec.number,
            };
          }
        }
      }
    }
    if (Object.values(roster).length === 0) {
      return ctx.respondSilently(
        `There are no members in ${sectionPhrase}${boldCourse(course)}`,
      );
    }

    let n = 1;
    let memberList = '';
    for (const [userId, courseMember] of Object.entries(roster)) {
      const sectionText =
        courseMember.sectionNum !== null
          ? italics(`Section ${courseMember.sectionNum}`)
          : underline(italics(`No section`));
      memberList += `${n}. <@${userId}> - ${sectionText}\n`;
      ++n;
    }

    return ctx.respondWithEmbed({
      type: Discord.EmbedType.RICH,
      title: `Members in ${sectionPhrase}${boldCourse(course)}`,
      description: memberList,
    });
  },
});

export default roster;
