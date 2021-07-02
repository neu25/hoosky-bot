import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { boldCourse } from '../_common';

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
    const roleId = ctx.getArgument<string>('role') as string;
    const sectionNum = parseInt(ctx.getArgument<string>('section') as string);

    const course = await ctx.courses().getByRoleId(guildId, roleId);
    if (!course) {
      return ctx.respondWithError('That course does not exist.');
    }

    const userId = ctx.mustGetUserId();

    const members = (await ctx.courses().getMembers(guildId, roleId)) ?? [];
    if (members.includes(userId)) {
      return ctx.respondWithError('You are already in that course.');
    }

    // Trigger will activate, automatically adding user to course
    await ctx.api.addRoleToMember(guildId, userId, roleId);

    // If a valid sectionNum was provided, add the user to the section.
    // If the section does not exist, create it with the user as a member.
    if (sectionNum) {
      const sections = course.sections ?? [];
      if (sections.some(item => item.number === sectionNum)) {
        ctx.sections().addMember(guildId, userId, roleId, sectionNum);
      } else {
        ctx
          .sections()
          .create(guildId, roleId, { number: sectionNum, members: [userId] });
      }

      return ctx.respondWithMessage(
        `You joined the section ${sectionNum} of the course ${boldCourse(
          course,
        )}`,
      );
    }

    return ctx.respondWithMessage(
      `You joined the course ${boldCourse(course)}`,
    );
  },
});

export default join;
