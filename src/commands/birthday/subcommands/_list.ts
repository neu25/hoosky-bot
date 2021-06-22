import SubCommand from '../../../SubCommand';
import { scanBirthdays } from '../_common';

export const list = new SubCommand({
  name: 'list',
  displayName: 'List Birthdays',
  description: 'List all stored birthdays',
  handler: async ctx => {
    await ctx.respondWithError('This is not yet implemented');

    // const guildId = ctx.mustGetGuildId();

    // let birthdaysList = 'Here is a list of birthdays: \n';
    // birthdaysList += '```';

    // const courses = await scanBirthdays(ctx, guildId);

    // let nextBirthday = await courses.next();
    // while (nextBirthday !== null) {
    //   // birthdaysList += `${nextBirthday._id} - ${nextBirthday.name}: ${nextBirthday.description} \n`;
    //   nextBirthday = await courses.next();
    // }

    // birthdaysList += '```';

    // await ctx.respondSilently(birthdaysList);
  },
});

export default list;
