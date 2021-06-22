import cron from 'cron';
import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { Collection, Config, BirthdaysConfig } from '../../database';
import { calculateDayOfYear } from '../../commands/birthday/_common';
import Api from '../../Api';
import { CreateMessage } from '../../Discord/message';

const scheduler = new Trigger<Discord.Event.CHANNEL_UPDATE>({
  event: Discord.Event.CHANNEL_UPDATE,
  handler: async ctx => {
    const guildId = ctx.getData().id;
    // const api = new Api(config.discord.appId, reqClient);

    const birthdaysCfg = await ctx.db.getConfigValue<BirthdaysConfig>(
      guildId,
      Config.BIRTHDAYS,
    );

    if (!birthdaysCfg) {
      throw new Error('No birthdays configuration found');
    }

    const channel = await birthdaysCfg.channel;
    const messages = await birthdaysCfg.messages;

    if (!messages || messages.length === 0) {
      throw new Error('No birthday messages configured');
    }

    // Run cron at 10:15 am every day.
    const test = new cron.CronJob('00 * * * * *', async () => {
      const dayOfYear = await calculateDayOfYear(new Date().toDateString());
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

        // // Map month groups to Discord embed fields.
        // const fields: Discord.EmbedField[] = subGroups.map(sub => ({
        //   name: sub.heading, // The month.
        //   value: sub.list, // The birthday list.
        // }));

        // await ctx.respondSilentlyWithEmbed({
        //   type: Discord.EmbedType.RICH,
        //   title: 'All Birthdays',
        //   fields,
        // });

        let randomMessage =
          messages[Math.floor(Math.random() * messages.length)]; // Pick a random message.
        randomMessage = randomMessage.replace('@', greeting); // Replace template with user mention(s)

        const messageData: CreateMessage = {
          content: randomMessage,
          tts: false,
        };

        await ctx.api.createMessage(channel, messageData);
      }
    });

    test.start();
  },
});

export default scheduler;
