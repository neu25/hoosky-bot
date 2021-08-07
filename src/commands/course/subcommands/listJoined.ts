import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { findUserSection, semiBoldCourse } from '../_common';
import { fancyCenter, italics, underline } from '../../../format';

type SubjectGroup = {
  subject: string;
  heading: string;
  list: string;
};

const listJoined = new SubCommand({
  name: 'list-joined',
  displayName: 'List Courses',
  description: 'Lists all available courses',
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
    const chosenUserId = ctx.getArgument<string>('user')!;

    let userId: string;
    if (chosenUserId) {
      userId = chosenUserId;
    } else {
      userId = ctx.mustGetUserId();
    }

    const guildMember = await ctx.api.getGuildMember(guildId, userId);
    const member = await ctx.api.getUser(userId);

    // Nickname if exists, otherwise username
    const username = guildMember.nick || member.username;

    // Hold an array of subject groups to output.
    const subGroups: SubjectGroup[] = [];
    // Record the current subject being written to.
    let curGroup: SubjectGroup | null = null;

    // Iterate over every course.
    const courses = await (await ctx.courses().scan(guildId))
      .sort({ code: 1 })
      .toArray();
    for (const c of courses) {
      const members = c.members;
      // If the current member is in the course
      if (members.includes(userId)) {
        // If the course's subject is different, then create a new subject group.
        if (!curGroup || c.subject !== curGroup.subject) {
          curGroup = {
            subject: c.subject,
            heading: fancyCenter(c.subject),
            list: '',
          };
          subGroups.push(curGroup);
        }

        // Find the section the user is in, if any.
        const userSection = findUserSection(c, userId);

        // Write the course to the subject group.
        curGroup.list += semiBoldCourse(c);
        curGroup.list += ' - ';
        curGroup.list += italics(
          userSection
            ? `Section ${userSection.number}`
            : underline('No section'),
        );
        curGroup.list += '\n';
      }
    }

    // Map subject groups to Discord embed fields.
    const fields: Discord.EmbedField[] = subGroups.map(sub => ({
      name: sub.heading, // The subject name.
      value: sub.list, // The course list.
    }));

    await ctx.interactionApi.respondWithEmbed({
      type: Discord.EmbedType.RICH,
      title: `${username}’s Course List`,
      fields,
    });
  },
});

export default listJoined;
