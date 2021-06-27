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
    const courses = (await ctx.courses().scan(guildId)).sort({ _id: 1 });
    const chosenUserId = ctx.getArgument<string>('user') as string;
    let userId;

    if (chosenUserId) {
      userId = chosenUserId;
    } else {
      userId = ctx.interaction.member?.user?.id;
      if (!userId) {
        return ctx.respondWithError('Unable to identify you');
      }
    }

    const guildMember = await ctx.api.getGuildMember(guildId, userId);
    const member = await ctx.api.getUser(userId);

    // Nickname if exists, otherwise username
    const username = guildMember.nick || member.username;

    const classmates = new Set<string>();

    // Iterate over every course.

    for (let c = await courses.next(); c !== null; c = await courses.next()) {
      for (const section of c.sections) {
        if (section.members.includes(userId)) {
          for (const member of section.members) {
            classmates.add(member);
          }
        }
      }
    }

    classmates.delete(userId);

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
