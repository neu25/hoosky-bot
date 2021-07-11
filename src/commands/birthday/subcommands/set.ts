import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { CommandOptionType } from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';

dayjs.extend(dayOfYear);

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
    const targetBirthday = ctx.getArgument<string>('date') as string;

    const dayOfYear = dayjs(targetBirthday).dayOfYear();
    if (!dayOfYear || typeof dayOfYear !== 'number') {
      return ctx.interactionApi.respondWithError(`Invalid birthday`);
    }

    if (await ctx.birthdays().exists(guildId, userId)) {
      return ctx.interactionApi.respondWithError(
        `A birthday is already set for <@${userId}>`,
      );
    }

    await ctx.birthdays().set(guildId, dayOfYear, userId);
    return ctx.interactionApi.respondWithMessage(
      `<@${userId}>, your birthday has been set to ${targetBirthday}!`,
    );
  },
});

export default set;
