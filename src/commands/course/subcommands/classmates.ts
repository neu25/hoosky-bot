import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { bold } from '../../../format';

type SharedClass = {
  code: string;
  sectionNumber: number;
};

type Classmate = {
  userId: string;
  sharedClasses: SharedClass[];
};

const sortClassmates = (classmates: Classmate[]): void => {
  classmates.sort((a, b) => {
    return b.sharedClasses.length - a.sharedClasses.length;
  });
};

const classmates = new SubCommand({
  name: 'classmates',
  displayName: 'List Classmates',
  description: 'Lists all people in the same section of a course as you',
  options: [
    // new CommandOption({
    //   name: 'user',
    //   description: 'Optional user, defaults to self if left empty',
    //   required: false,
    //   type: Discord.CommandOptionType.USER,
    // }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const targetUserId = ctx.mustGetUserId();
    // const chosenUserId = ctx.getArgument<string>('user')!;

    const classmates: Record<string, Classmate> = {};

    const courses = await (await ctx.courses().scan(guildId))
      .sort({ code: 1 })
      .toArray();
    // Iterate over every course.
    for (const c of courses) {
      const userSection = Object.values(c.sections).find(sec =>
        sec.members.includes(targetUserId),
      );

      // User not found in any of this course's sections, so skip.
      if (!userSection) continue;

      // Add all of the members in the section.
      for (const m of userSection.members) {
        // Don't count yourself as a classmate.
        if (m === targetUserId) continue;
        classmates[m] = classmates[m] ?? { userId: m, sharedClasses: [] };
        classmates[m].sharedClasses.push({
          code: c.code,
          sectionNumber: userSection.number,
        });
      }
    }

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

    const classmateArr = Object.values(classmates);
    if (classmateArr.length === 0) {
      return ctx.interactionApi.respondSilently(
        `${username} has no classmates`,
      );
    }

    // Sort classmates in order of descending number of shared classes.
    sortClassmates(classmateArr);

    let classmateList = '';
    let n = 1;
    for (const cm of classmateArr) {
      const sharedStr = cm.sharedClasses
        .map(cls => `${bold(cls.code)} #${cls.sectionNumber}`)
        .join(', ');
      classmateList += `${n}. <@${cm.userId}> - ${sharedStr}\n`;
      ++n;
    }

    await ctx.interactionApi.respondWithEmbed({
      type: Discord.EmbedType.RICH,
      title: `${username}’s Classmates`,
      description: classmateList,
    });
  },
});

export default classmates;
