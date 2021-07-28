import dayjs from 'dayjs';
import { bold, pluralize } from '../format';
import { JobHandler, JobType } from './index';

export type SendCountdownAnnouncementsData = {
  guildId: string;
};

const sendCountdownAnnouncements: JobHandler<JobType.SEND_COUNTDOWN_ANNOUNCEMENTS> =
  async ctx => {
    const { guildId } = ctx.data;

    const today = dayjs();

    const countdownDates = await (await ctx.repos.countdowns.scan(guildId))
      .sort({ _id: 1 })
      .toArray();
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
        msg = `There ${daysToEnd === 1 ? 'is' : 'are'} ${bold(
          daysToEnd.toLocaleString(),
        )} ${pluralize('day', daysToEnd)} left!`;
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

        // Delete previous announcement(s).
        await ctx.repos.countdownAnnouncements.deleteByEventId(
          guildId,
          eventId,
        );

        // Store new announcement.
        await ctx.repos.countdownAnnouncements.create(
          guildId,
          messageId,
          channelId,
          eventId,
        );
      }
    }
  };

export default sendCountdownAnnouncements;
