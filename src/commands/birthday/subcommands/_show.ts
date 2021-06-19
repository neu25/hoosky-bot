import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { getTargetUser, userHasBirthday, getBirthday } from '../_common';

export const show = new SubCommand({
  name: 'show',
  displayName: 'Show',
  description: "Show a user's birthday",
  options: [
    new CommandOption({
      name: 'user',
      description: 'User',
      required: false,
      type: CommandOptionType.USER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const requestor = ctx.interaction.member?.user;
    const requestorId = requestor?.id;
    const targetUserId = ctx.getArgument<string>('user') as string;

    const targetUser = await getTargetUser(ctx, requestorId, targetUserId);

    if (targetUser) {
      if (await userHasBirthday(ctx, guildId, targetUser.id)) {
        const birthday = await getBirthday(ctx, guildId, targetUser.id);

        if (birthday) {
          return ctx.respondWithMessage(
            `Birthday for ${targetUser.username}#${targetUser.discriminator} is set to day ${birthday.birthday}`,
          );
        }

        return ctx.respondWithError(`Error fetching birthday`);
      }

      return ctx.respondWithError(
        `No birthday is set for ${targetUser.username}#${targetUser.discriminator}`,
      );
    }
  },
});

export default show;
