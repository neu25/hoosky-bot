import dayjs, { Dayjs } from 'dayjs';
import { CommandOptionType } from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { bold } from '../../../format';
import ExecutionContext from '../../../ExecutionContext';

const validateBirthday = (birthday: string): boolean => {
  return /^\d{1,2}\/\d{1,2}$/.test(birthday);
};

const respondWithInvalidBirthday = (ctx: ExecutionContext): Promise<void> => {
  return ctx.interactionApi.respondWithError(
    `Invalid birthday. Make sure your birthday is in the format ${bold(
      'MM/DD',
    )}.`,
  );
};

export const set = new SubCommand({
  name: 'set',
  displayName: 'Set Birthday',
  description: 'Set your birthday',
  options: [
    new CommandOption({
      name: 'date',
      description: 'Your birthday (MM/DD)',
      required: true,
      type: CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const userId = ctx.mustGetUserId();
    const targetBirthday = ctx.getArgument<string>('date')!.trim();

    // 1st validation pass using regex.
    if (!validateBirthday(targetBirthday)) {
      return respondWithInvalidBirthday(ctx);
    }

    let day: Dayjs;
    if (targetBirthday === '02/29' || targetBirthday === '2/29') {
      day = dayjs('2/29/2000');
    } else {
      day = dayjs(targetBirthday);
    }

    // 2nd validation pass using dayjs parsing.
    if (!day.isValid()) {
      return respondWithInvalidBirthday(ctx);
    }

    const dateKey = day.format('MM/DD');
    const prettyDate = day.format('MMMM D');

    // If they've already set their birthday, unset it.
    if (await ctx.birthdays().exists(guildId, userId)) {
      await ctx.birthdays().unset(guildId, userId);
    }

    await ctx.birthdays().set(guildId, dateKey, userId);
    return ctx.interactionApi.respondWithMessage(
      `Your birthday has been set to ${prettyDate}!`,
    );
  },
});

export default set;
