import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { getTargetUser, userHasBirthday, unsetBirthday } from '../_common';

export const unset = new SubCommand({
  name: 'unset',
  displayName: 'Unset',
  description: "Unset a user's birthday",
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
        const birthday = await unsetBirthday(ctx, guildId, targetUser.id);

        if (birthday) {
          return ctx.respondWithMessage(
            `Birthday unset for ${targetUser.username}#${targetUser.discriminator}`,
          );
        }

        return ctx.respondWithError(`Error unsetting birthday`);
      }

      return ctx.respondWithError(
        `No birthday is set for ${targetUser.username}#${targetUser.discriminator}`,
      );
    }
  },
});

export default unset;
