import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { calculateDayOfYear, userHasBirthday, setBirthday } from '../_common';

export const set = new SubCommand({
  name: 'set',
  displayName: 'Set Birthday',
  description: 'Set your birthday',
  options: [
    new CommandOption({
      name: 'date',
      description: "User's birthday (MM/DD)",
      required: true,
      type: CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const targetBirthday = ctx.getArgument<string>('date') as string;
    const requestor = ctx.interaction.member?.user;

    const dayOfYear = calculateDayOfYear(targetBirthday);

    if (!dayOfYear || typeof dayOfYear !== 'number') {
      return ctx.respondWithError(`Invalid birthday`);
    }

    if (requestor) {
      if (!(await userHasBirthday(ctx, guildId, requestor.id))) {
        const birthday = await setBirthday(
          ctx,
          guildId,
          dayOfYear,
          requestor.id,
        );

        if (birthday) {
          return ctx.respondWithMessage(
            `Birthday (${targetBirthday}) set for ${requestor.username}#${requestor.discriminator}`,
          );
        }

        return ctx.respondWithError(`Unable to set birthday`);
      }

      return ctx.respondWithError(
        `A birthday is already set for ${requestor.username}#${requestor.discriminator}`,
      );
    }

    return ctx.respondWithError(`Unable to identify you`);
  },
});

export default set;
