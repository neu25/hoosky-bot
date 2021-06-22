import cron from 'cron';
import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { Collection, Config, BirthdaysConfig } from '../../database';
import { calculateDayOfYear } from '../../commands/birthday/_common';

const scheduler = new Trigger<Discord.Event.CHANNEL_UPDATE>({
  event: Discord.Event.CHANNEL_UPDATE,
  handler: async ctx => {
    const guildId = ctx.getData().id;

    const birthdaysCfg = await ctx.db.getConfigValue<BirthdaysConfig>(
      guildId,
      Config.BIRTHDAYS,
    );

    if (!birthdaysCfg) {
      throw new Error('No birthdays configuration found');
    }

    // const channel = birthdaysCfg.channel;
    const messages = birthdaysCfg.messages;

    if (!messages || messages.length === 0) {
      throw new Error('No birthday messages configured');
    }

    // Run cron at 10:15 am every day.
    const test = new cron.CronJob('00 15 10 * * *', async () => {
      const dayOfYear = await calculateDayOfYear(new Date().toDateString());
      const birthdays = await ctx.db
        .getDb(guildId)
        .collection(Collection.BIRTHDAYS)
        .find({ _id: dayOfYear });

      if (birthdays) {
        // TODO: Send a random message from `messages` in `channel`.
      }
    });

    test.start();
  },
});

export default scheduler;
