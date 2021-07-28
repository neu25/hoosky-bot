import dayjs from 'dayjs';
import { bold } from '../format';
import { JobHandler, JobType } from './index';

export type SendCountdownAnnouncementsData = {
  guildId: string;
};

const sendCountdownAnnouncements: JobHandler<JobType.SEND_COUNTDOWN_ANNOUNCEMENTS> =
  async ctx => {
    const { guildId } = ctx.data;

    const today = dayjs();

    const countdowns = await ctx.repos.countdowns.list(guildId);
    if (!countdowns) {
      return;
    }

    for (const c of countdowns) {
      const endDay = dayjs(c._id, 'YYYY-MM-DD');
      const daysToEnd = endDay.diff(today, 'days');

      for (const ev of c.events) {
        let msg: string;
        if (daysToEnd === 0) {
          msg = bold('TODAY') + ' is the day!';
        } else {
          msg = `There are ${bold(daysToEnd.toLocaleString())} days left!`;
        }

        await ctx.api.createMessage(ev.channel, {
          embeds: [
            {
              title: `🗓️ Countdown to ${ev.name}`,
              description: msg,
            },
          ],
        });
      }
    }
  };

export default sendCountdownAnnouncements;
