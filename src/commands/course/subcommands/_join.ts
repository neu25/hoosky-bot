import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import {
  getCourseByRoleId,
  addUserToCourse,
  getCourseMembers,
  boldCourse,
  createSection,
  addUserToSection,
} from '../_common';

export const join = new SubCommand({
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

    const course = await getCourseByRoleId(ctx, guildId, roleId);
    if (!course) {
      return ctx.respondWithError('That course does not exist');
    }

    const userId = ctx.interaction.member?.user?.id;
    if (!userId) {
      return ctx.respondWithError('Unable to identify you');
    }

    const courseMembers = (await getCourseMembers(ctx, guildId, roleId)) ?? [];
    if (courseMembers.includes(userId)) {
      return ctx.respondWithError('You are already in that course');
    }

    await ctx.api.addRoleToMember(guildId, userId, roleId);
    await addUserToCourse(ctx, guildId, userId, roleId);

    // If a valid sectionNum was provided, add the user to the section.
    // If the section does not exist, create it with the user as a member.
    if (sectionNum) {
      const sections = course.sections ?? []
      if (sections.some(item => item.number === sectionNum)) {
        addUserToSection(ctx, guildId, userId, roleId, sectionNum);
      } else {
        createSection(ctx, guildId, roleId, sectionNum, [userId]);
      }

      return ctx.respondWithMessage(
        `You joined the section ${sectionNum} of the course ${boldCourse(course)}`,
      );
    }

    return ctx.respondWithMessage(
      `You joined the course ${boldCourse(course)}`,
    );
  },
});
