import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { addUserToPossiblyNonexistentSection, boldCourse } from '../_common';

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
    const roleId = ctx.getArgument<string>('role') as string;
    const sectionNum = ctx.getArgument<string>('section');

    const course = await ctx.courses().getByRoleId(guildId, roleId);
    if (!course) {
      return ctx.respondWithError('That course does not exist.');
    }

    const members = (await ctx.courses().getMembers(guildId, roleId)) ?? [];
    if (members.includes(userId)) {
      return ctx.respondWithError('You are already in that course.');
    }

    // `GUILD_MEMBER_UPDATE` trigger will activate and automatically add the
    // user to the course in the database. Thus, there's no need to do it here.
    await ctx.api.addRoleToMember(guildId, userId, roleId);

    if (sectionNum === undefined || sectionNum === null) {
      // No section number provided, exit early.
      return ctx.respondWithMessage(
        `You joined the course ${boldCourse(course)}`,
      );
    }

    // A valid sectionNum was provided, so add the user to the section.
    await addUserToPossiblyNonexistentSection(
      ctx,
      course,
      parseInt(sectionNum),
      userId,
    );

    return ctx.respondWithMessage(
      `You joined section ${sectionNum} of course ${boldCourse(course)}`,
    );
  },
});

export default join;
