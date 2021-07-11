import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { bold, fancyCenter } from '../../../format';

dayjs.extend(dayOfYear);

type MonthGroup = {
  month: string;
  heading: string;
  list: string;
};

export const list = new SubCommand({
  name: 'list',
  displayName: 'List Birthdays',
  description: 'List all stored birthdays',
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const birthdays = (await ctx.birthdays().scan(guildId)).sort({ _id: 1 });

    // Hold an array of month groups to output.
    const subGroups: MonthGroup[] = [];
    // Record the current month being written to.
    let curGroup: MonthGroup | null = null;

    // Iterate over every birthday.
    let c = await birthdays.next();
    while (c !== null) {
      // If the birthday's month is different, then create a new month group.
      const formattedMonth = dayjs().dayOfYear(c._id).format('MMMM');
      if (!curGroup || formattedMonth !== curGroup.month) {
        curGroup = {
          month: formattedMonth,
          heading: fancyCenter(formattedMonth, 50),
          list: '',
        };
        subGroups.push(curGroup);
      }

      if (c.users.length > 0) {
        curGroup.list += `${bold(
          formattedMonth + ' ' + dayjs().dayOfYear(c._id).format('DD'),
        )}: ${c.users
          .map(user => {
            return `<@${user}>`;
          })
          .join(' • ')}\n`;
      }

      c = await birthdays.next();
    }

    // Map month groups to Discord embed fields.
    const fields: Discord.EmbedField[] = subGroups.map(sub => ({
      name: sub.heading, // The month.
      value: sub.list, // The birthday list.
    }));

    await ctx.interactionApi.respondSilentlyWithEmbed({
      type: Discord.EmbedType.RICH,
      title: 'All Birthdays',
      fields,
    });
  },
});

export default list;
