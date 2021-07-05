import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';

const classmates = new SubCommand({
  name: 'classmates',
  displayName: 'List Classmates',
  description: 'Lists all people in the same section of a course as you',
  options: [
    new CommandOption({
      name: 'user',
      description: 'Optional user, defaults to self if left empty',
      required: false,
      type: Discord.CommandOptionType.USER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const executorId = ctx.mustGetUserId();
    const chosenUserId = ctx.getArgument<string>('user') as string;

    const targetUserId = chosenUserId || executorId;

    const courses = await (await ctx.courses().scan(guildId))
      .sort({ _id: 1 })
      .toArray();
    const classmates = new Set<string>();
    // Iterate over every course.
    for (const c of courses) {
      const userSection = Object.values(c.sections).find(sec =>
        sec.members.includes(targetUserId),
      );

      // User not found in any of this course's sections, so skip.
      if (!userSection) continue;

      // Add all of the members in the section.
      for (const m of userSection.members) {
        classmates.add(m);
      }
    }

    // Remove yourself from the classmate list.
    classmates.delete(targetUserId);

    // Nickname if exists, otherwise username
    let username: string;
    {
      const guildMember = await ctx.api.getGuildMember(guildId, targetUserId);
      if (guildMember.nick) {
        username = guildMember.nick;
      } else {
        const member = await ctx.api.getUser(targetUserId);
        username = member.username;
      }
    }

    if (classmates.size == 0) {
      return ctx.respondSilently(`${username} has no classmates.`);
    }

    const classmateArr = Array.from(classmates);
    let classmateList = '';
    for (let i = 0; i < classmateArr.length; i++) {
      classmateList += `${i + 1}. <@${classmateArr[i]}>\n`;
    }

    await ctx.respondSilentlyWithEmbed({
      type: Discord.EmbedType.RICH,
      title: `Classmates of ${username}`,
      description: classmateList,
    });
  },
});

export default classmates;
