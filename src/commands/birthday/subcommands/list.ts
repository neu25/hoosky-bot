import dayjs from 'dayjs';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { bold, fancyCenter } from '../../../format';

type MonthGroup = {
  month: string;
  count: number;
  list: string;
};

export const list = new SubCommand({
  name: 'list',
  displayName: 'List Birthdays',
  description: 'List all stored birthdays',
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const birthdays = await (await ctx.birthdays().scan(guildId))
      .sort({ _id: 1 })
      .toArray();

    // Hold an array of month groups to output.
    const subGroups: MonthGroup[] = [];
    // Record the current month being written to.
    let curGroup: MonthGroup | null = null;

    // Iterate over every birthday.
    for (const b of birthdays) {
      // If the birthday's month is different, then create a new month group.
      const formattedMonth = dayjs(b._id).format('MMMM');
      if (!curGroup || formattedMonth !== curGroup.month) {
        curGroup = {
          month: formattedMonth,
          count: 0,
          list: '',
        };
        subGroups.push(curGroup);
      }

      if (b.users.length > 0) {
        curGroup.count += b.users.length;
        curGroup.list += `${bold(
          formattedMonth + ' ' + dayjs(b._id).format('D'),
        )}: ${b.users
          .map(user => {
            return `<@${user}>`;
          })
          .join(' • ')}\n`;
      }
    }

    // Map month groups to Discord embed fields.
    const fields: Discord.EmbedField[] = subGroups.map(sub => ({
      name: fancyCenter(`${sub.month} (${sub.count})`, 50),
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
