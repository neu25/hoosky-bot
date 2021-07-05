import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { addUserToPossiblyNonexistentSection, boldCourse } from '../_common';

const switchSection = new SubCommand({
  name: 'switch-section',
  displayName: 'Switch Course Section',
  description: "Switch section of a course you're in",
  options: [
    new CommandOption({
      name: 'role',
      description: 'The course role',
      required: true,
      type: Discord.CommandOptionType.ROLE,
    }),
    new CommandOption({
      name: 'section',
      description: 'The section to switch to',
      required: true,
      type: Discord.CommandOptionType.INTEGER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const roleId = ctx.getArgument<string>('role') as string;
    const sectionNum = parseInt(ctx.getArgument<string>('section') as string);
    const userId = ctx.mustGetUserId();

    const course = await ctx.courses().getByRoleId(guildId, roleId);
    if (!course) {
      return ctx.respondWithError('That course does not exist');
    }

    const courseMembers =
      (await ctx.courses().getMembers(guildId, roleId)) ?? [];
    if (!courseMembers.includes(userId)) {
      return ctx.respondWithError(`You aren't in that course`);
    }

    await ctx
      .courses()
      .removeMemberFromSection(guildId, roleId, sectionNum, userId);

    // Add the user to the section.
    await addUserToPossiblyNonexistentSection(ctx, course, sectionNum, userId);

    return ctx.respondWithMessage(
      `You switched to section ${sectionNum} of the course ${boldCourse(
        course,
      )}`,
    );
  },
});

export default switchSection;
