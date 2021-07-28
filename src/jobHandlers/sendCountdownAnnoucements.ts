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

    const countdownDates = await ctx.repos.countdowns.list(guildId);
    if (!countdownDates) {
      return;
    }

    for (const date of countdownDates) {
      const endDay = dayjs(date._id, 'YYYY-MM-DD');
      const hoursToEnd = endDay.diff(today, 'hours');
      const daysToEnd = Math.ceil(hoursToEnd / 24);

      let msg: string;
      if (daysToEnd === 0) {
        msg = bold('TODAY') + ' is the day!';

        // Delete this countdown date, which has reached 0.
        await ctx.repos.countdowns.deleteCountdown(guildId, date._id);
      } else {
        msg = `There are ${bold(daysToEnd.toLocaleString())} days left!`;
      }

      for (const ev of date.events) {
        const sentMessage = await ctx.api.createMessage(ev.channel, {
          embeds: [
            {
              title: `🗓️ Countdown to ${ev.name}`,
              description: msg,
            },
          ],
        });

        const channelId = sentMessage.channel_id;
        const messageId = sentMessage.id;
        const eventId = ev.id;

        if (daysToEnd === 0) {
          await ctx.repos.countdownAnnouncements.deleteByEventId(
            guildId,
            eventId,
          );
        } else {
          await ctx.repos.countdownAnnouncements.create(
            guildId,
            channelId,
            messageId,
            eventId,
          );
        }
      }
    }
  };

export default sendCountdownAnnouncements;
