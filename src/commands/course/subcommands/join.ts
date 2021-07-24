import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { addUserToPossiblyNonexistentSection, boldCourse } from '../_common';
import { bold, inlineCode } from '../../../format';

const postJoinSectionText = `Run ${inlineCode(
  '/course classmates',
)} to see the people in your classes.`;

const postJoinCourseText = `To get matched with other people in your class section, run this command again with the ${bold(
  'section',
)} argument.`;

const join = new SubCommand({
  name: 'join',
  displayName: 'Join Course',
  description: 'Joins a course',
  options: [
    new CommandOption({
      name: 'role',
      description: 'The course role',
      required: true,
      type: Discord.CommandOptionType.ROLE,
    }),
    new CommandOption({
      name: 'section',
      description: 'The number of your course section',
      required: false,
      type: Discord.CommandOptionType.INTEGER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const userId = ctx.mustGetUserId();
    const roleId = ctx.getArgument<string>('role')!;
    const sectionNum = ctx.getArgument<string>('section');

    const course = await ctx.courses().getByRoleId(guildId, roleId);
    if (!course) {
      return ctx.interactionApi.respondWithError('That course does not exist.');
    }

    const members = (await ctx.courses().getMembers(guildId, roleId)) ?? [];
    if (members.includes(userId)) {
      if (sectionNum === undefined) {
        return ctx.interactionApi.respondWithError(
          'You are already in that course. ' +
            'Did you intend to join a class section? If so, provide the ' +
            bold('section') +
            ' argument.',
        );
      }

      await ctx.courses().removeMemberFromAllSections(guildId, roleId, userId);

      // A valid sectionNum was provided, so add the user to the section.
      await addUserToPossiblyNonexistentSection(
        ctx,
        course,
        parseInt(sectionNum),
        userId,
      );

      return ctx.interactionApi.respondWithMessage(
        `You switched to ${bold(
          `Section ${sectionNum}`,
        )} of course ${boldCourse(course)}.\n${postJoinSectionText}`,
      );
    }

    // `GUILD_MEMBER_UPDATE` trigger will activate and automatically add the
    // user to the course in the database. Thus, there's no need to do it here.
    await ctx.api.addRoleToMember(guildId, userId, roleId);

    if (sectionNum === undefined) {
      // No section number provided, exit early.
      return ctx.interactionApi.respondWithMessage(
        `You joined the course ${boldCourse(course)}.\n${postJoinCourseText}`,
      );
    }

    // A valid sectionNum was provided, so add the user to the section.
    await addUserToPossiblyNonexistentSection(
      ctx,
      course,
      parseInt(sectionNum),
      userId,
    );

    return ctx.interactionApi.respondWithMessage(
      `You joined ${bold(`Section ${sectionNum}`)} of course ${boldCourse(
        course,
      )}.\n${postJoinSectionText}`,
    );
  },
});

export default join;
