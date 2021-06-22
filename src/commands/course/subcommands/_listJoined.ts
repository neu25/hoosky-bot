import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { semiBoldCourse, scanCourses, getCourseMembers } from '../_common';
import { fancyCenter } from '../../../format';

type SubjectGroup = {
  subject: string;
  heading: string;
  list: string;
};

export const listJoined = new SubCommand({
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
    const courses = (await scanCourses(ctx, guildId)).sort({ _id: 1 });
    const chosenUserId = ctx.getArgument<string>('user') as string;
    let userId;

    if (chosenUserId) {
      userId = chosenUserId;
    }
    else {
      userId = ctx.interaction.member?.user?.id;
      if (!userId) {
        return ctx.respondWithError('Unable to identify you');
      }
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
    let c = await courses.next();
    while (c !== null) {


      const members = c.members;
      // If the current member is in the course
      if (members.includes(userId)) {
        // If the course's subject is different, then create a new subject group.
        if (!curGroup || c.subject !== curGroup.subject) {
          curGroup = {
            subject: c.subject,
            heading: fancyCenter(c.subject, 50),
            list: '',
          };
          subGroups.push(curGroup);
        }

        // Write the course to the subject group.
        curGroup.list += semiBoldCourse(c) + '\n';
      }
      c = await courses.next();
    }

    // Map subject groups to Discord embed fields.
    const fields: Discord.EmbedField[] = subGroups.map(sub => ({
      name: sub.heading, // The subject name.
      value: sub.list, // The course list.
    }));

    await ctx.respondSilentlyWithEmbed({
      type: Discord.EmbedType.RICH,
      title: `Course List for ${username}`,
      fields,
    });
  },
});
