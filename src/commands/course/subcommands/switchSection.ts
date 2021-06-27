import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { boldCourse } from '../_common';

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
      name: 'section-number',
      description: 'The section to switch to',
      required: true,
      type: Discord.CommandOptionType.INTEGER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const roleId = ctx.getArgument<string>('role') as string;
    const sectionNum = parseInt(
      ctx.getArgument<string>('section-number') as string,
    );

    const course = await ctx.courses().getByRoleId(guildId, roleId);
    if (!course) {
      return ctx.respondWithError('That course does not exist');
    }

    const userId = ctx.interaction.member?.user?.id;
    if (!userId) {
      return ctx.respondWithError('Unable to identify you');
    }

    const courseMembers =
      (await ctx.courses().getMembers(guildId, roleId)) ?? [];
    if (!courseMembers.includes(userId)) {
      return ctx.respondWithError(`You aren't in that course`);
    }

    ctx.sections().removeMember(guildId, roleId, userId);

    const sections = course.sections ?? [];
    if (sections.some(item => item.number === sectionNum)) {
      ctx.sections().addMember(guildId, userId, roleId, sectionNum);
    } else {
      ctx
        .sections()
        .create(guildId, roleId, { number: sectionNum, members: [userId] });
    }

    return ctx.respondWithMessage(
      `You switched to section ${sectionNum} of the course ${boldCourse(
        course,
      )}`,
    );
  },
});

export default switchSection;
