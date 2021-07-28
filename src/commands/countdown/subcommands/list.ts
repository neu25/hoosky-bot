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

const list = new SubCommand({
  name: 'list',
  displayName: 'List Countdowns',
  description: 'List all current countdowns',
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const dates = await (await ctx.countdowns().scan(guildId))
      .sort({ _id: 1 })
      .toArray();

    const subGroups: MonthGroup[] = [];
    let curGroup: MonthGroup | null = null;

    for (const d of dates) {
      if (d.events.length === 0) continue;

      const month = dayjs(d._id).format('MMMM');
      const year = dayjs(d._id).year();

      if (!curGroup || month !== curGroup.month || year !== curGroup.year) {
        curGroup = {
          month,
          year,
          heading: fancyCenter(`${month} ${year}`),
          list: '',
        };
        subGroups.push(curGroup);
      }

      if (d.events.length > 0) {
        curGroup.list += `${bold(
          month + ' ' + dayjs(d._id).format('DD'),
        )}: ${d.events
          .map(event => `${event.name} - \`ID ${event.id}\``)
          .join(' • ')}\n`;
      }
    }

    const fields: Discord.EmbedField[] = subGroups.map(sub => ({
      name: sub.heading, // The month.
      value: sub.list, // The countdown list.
    }));

    await ctx.interactionApi.respondWithEmbed({
      type: Discord.EmbedType.RICH,
      title: 'All Countdowns',
      fields,
    });
  },
});

export default list;
