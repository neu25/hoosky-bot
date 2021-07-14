import dayjs from 'dayjs';
import { CommandOptionType } from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';

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

    let date;
    let formattedDate;
    if (targetBirthday === '02/29' || targetBirthday === '2/29') {
      date = dayjs('2/29/2000').format('MM/DD');
      formattedDate = dayjs('2/29/2000').format('MMMM D');
    } else {
      date = dayjs(targetBirthday).format('MM/DD');
      formattedDate = dayjs(targetBirthday).format('MMMM D');
    }

    if (!date) {
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

    await ctx.birthdays().set(guildId, date, requestor.id);
    return ctx.interactionApi.respondWithMessage(
      `<@${requestor.id}>, your birthday has been set to ${formattedDate}!`,
    );
  },
});

export default set;
