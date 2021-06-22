import SubCommand from '../../../SubCommand';
import { userHasBirthday, unsetBirthday } from '../_common';

export const unset = new SubCommand({
  name: 'unset',
  displayName: 'Unset Birthday',
  description: 'Unset your birthday',
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const requestor = ctx.interaction.member?.user;

    if (requestor) {
      if (await userHasBirthday(ctx, guildId, requestor.id)) {
        const birthday = await unsetBirthday(ctx, guildId, requestor.id);

        if (birthday) {
          return ctx.respondWithMessage(
            `Birthday unset for ${requestor.username}#${requestor.discriminator}`,
          );
        }

        return ctx.respondWithError(`Error unsetting birthday`);
      }

      return ctx.respondWithError(
        `No birthday is set for ${requestor.username}#${requestor.discriminator}`,
      );
    }

    return ctx.respondWithError(`Unable to identify you`);
  },
});

export default unset;
