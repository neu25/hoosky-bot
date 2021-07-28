import dayjs from 'dayjs';
import isLeapYearPlugin from 'dayjs/plugin/isLeapYear';
import { BirthdaysConfig } from '../repository';
import { Config } from '../database';
import { CreateMessage } from '../Discord/message';
import { JobHandler, JobType } from './index';

dayjs.extend(isLeapYearPlugin);

export type SendBirthdayMessagesData = {
  guildId: string;
};

const sendBirthdayMessages: JobHandler<JobType.SEND_BIRTHDAY_MESSAGES> =
  async ctx => {
    const { guildId } = ctx.data;

    const birthdaysCfg = await ctx.repos.config.get<BirthdaysConfig>(
      guildId,
      Config.BIRTHDAYS,
    );
    if (!birthdaysCfg) {
      throw new Error('No birthdays configuration found');
    }

    const { channel, messages } = birthdaysCfg;
    if (!messages || messages.length === 0) {
      throw new Error('No birthday messages configured');
    }

    const today = dayjs().format('MM/DD');
    const isLeapYear = dayjs().isLeapYear();
    const birthdays = await ctx.repos.birthdays.getByDay(guildId, today);

    if (channel && birthdays && birthdays.users.length > 0) {
      await ctx.auditLogger.logMessage({
        title: 'Giving happy birthday wishes',
        description:
          'I am wishing happy birthday to the following people:\n' +
          birthdays.users.map(userId => `• <@${userId}>`).join('\n'),
      });

      let greeting = '';
      birthdays.users.map((user: string, i: number) => {
        greeting += `<@${user}>`;
        if (i !== birthdays.users.length - 1) {
          greeting += ' • ';
        }
      });

      let randomMessage =
        messages[Math.floor(Math.random() * messages.length)].message; // Pick a random message.
      randomMessage = randomMessage.replace('%', greeting); // Replace template with user mention(s)
      const messageData: CreateMessage = {
        content: randomMessage,
        tts: false,
      };

      await ctx.api.createMessage(channel, messageData);
    } else {
      await ctx.auditLogger.logMessage({
        title: 'Skipping happy birthday wishes',
        description: 'There are no birthdays today.',
      });
    }

    // Send leap year messages
    if (!isLeapYear && today === '02/28') {
      const leapYearBirthdays = await ctx.repos.birthdays.getByDay(
        guildId,
        dayjs('2/29/2000').format('MM/DD'),
      );

      if (channel && leapYearBirthdays && leapYearBirthdays.users.length > 0) {
        let greeting = '';

        leapYearBirthdays.users.map((user: string, i: number) => {
          greeting += `<@${user}>`;
          if (i !== leapYearBirthdays.users.length - 1) {
            greeting += ' • ';
          }
          if (i === leapYearBirthdays.users.length - 1) {
            greeting += ' (Feb. 29)';
          }
        });

        let randomMessage =
          messages[Math.floor(Math.random() * messages.length)].message; // Pick a random message.
        randomMessage = randomMessage.replace('%', greeting); // Replace template with user mention(s)
        const messageData: CreateMessage = {
          content: randomMessage,
          tts: false,
        };

        await ctx.api.createMessage(channel, messageData);
      }
    }
  };

export default sendBirthdayMessages;
