import cron from 'cron';
import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { Collection, Config, BirthdaysConfig } from '../../database';
import { calculateDayOfYear } from '../../commands/birthday/_common';
import { CreateMessage } from '../../Discord/message';

const birthdayScheduler = new Trigger<Discord.Event.CHANNEL_UPDATE>({
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

    const schedule = await birthdaysCfg.schedule;
    const channel = await birthdaysCfg.channel;
    const messages = await birthdaysCfg.messages;

    if (!schedule || schedule.split(' ').length !== 6) {
      throw new Error('No birthdays schedule configured');
    }

    if (!messages || messages.length === 0) {
      throw new Error('No birthday messages configured');
    }

    // Run cron at configured time every day.
    const scheduler = new cron.CronJob(
      schedule,
      async () => {
        const dayOfYear = calculateDayOfYear(new Date().toDateString());
        const birthdays = await ctx.db
          .getDb(guildId)
          .collection(Collection.BIRTHDAYS)
          .findOne({ _id: dayOfYear });

        if (channel && birthdays && birthdays.users.length > 0) {
          let greeting = '';
          birthdays.users.map((user: string, i: number) => {
            greeting += `<@${user}>`;

            if (i !== birthdays.users.length - 1) {
              greeting += ' • ';
            }
          });

          let randomMessage =
            messages[Math.floor(Math.random() * messages.length)]; // Pick a random message.
          randomMessage = randomMessage.replace('@', greeting); // Replace template with user mention(s)

          const messageData: CreateMessage = {
            content: randomMessage,
            tts: false,
          };

          await ctx.api.createMessage(channel, messageData);
        }
      },
      undefined,
      undefined,
      'America/New_York',
    );

    scheduler.start();
  },
});

export default birthdayScheduler;
