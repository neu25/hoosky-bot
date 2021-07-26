import dayjs from 'dayjs';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { bold, fancyCenter } from '../../../format';

type MonthGroup = {
  month: string;
  year: number;
  heading: string;
  list: string;
};

export const list = new SubCommand({
  name: 'list',
  displayName: 'List Countdowns',
  description: 'List all stored countdowns',
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const dates = await (await ctx.countdowns().scan(guildId))
      .sort({ _id: 1 })
      .toArray();

    const subGroups: MonthGroup[] = [];
    let curGroup: MonthGroup | null = null;

    for (const date of dates) {
      const month = dayjs(date._id).format('MMMM');
      const year = dayjs(date._id).year();
      if (!curGroup || month !== curGroup.month || year !== curGroup.year) {
        curGroup = {
          month,
          year,
          heading: fancyCenter(`${month} ${year}`, 50),
          list: '',
        };
        subGroups.push(curGroup);
      }

      if (date.events.length > 0) {
        curGroup.list += `${bold(
          month + ' ' + dayjs(date._id).format('DD'),
        )}: ${date.events.map(event => event.name).join(' • ')}\n`;
      }
    }

    const fields: Discord.EmbedField[] = subGroups.map(sub => ({
      name: sub.heading, // The month.
      value: sub.list, // The birthday list.
    }));

    await ctx.interactionApi.respondSilentlyWithEmbed({
      type: Discord.EmbedType.RICH,
      title: 'All Countdowns',
      fields,
    });
  },
});
