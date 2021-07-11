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
    const targetBirthday = ctx.getArgument<string>('date') as string;
    const requestor = ctx.interaction.member?.user;

    const dayOfYear = dayjs(targetBirthday).dayOfYear();

    if (!dayOfYear || typeof dayOfYear !== 'number') {
      return ctx.interactionApi.respondWithError(`Invalid birthday`);
    }

    if (!requestor || !requestor.id) {
      return ctx.interactionApi.respondWithError(`Unable to identify you`);
    }

    if (await ctx.birthdays().exists(guildId, requestor.id)) {
      return ctx.interactionApi.respondWithError(
        `A birthday is already set for <@${requestor.id}>`,
      );
    }

    await ctx.birthdays().set(guildId, dayOfYear, requestor.id);
    return ctx.interactionApi.respondWithMessage(
      `<@${requestor.id}>, your birthday has been set to ${targetBirthday}!`,
    );
  },
});

export default set;
