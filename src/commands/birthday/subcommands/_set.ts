import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import {
  calculateDayOfYear,
  getTargetUser,
  userHasBirthday,
  setBirthday,
} from '../_common';

export const set = new SubCommand({
  name: 'set',
  displayName: 'Set Birthday',
  description: "Set a user's birthday",
  options: [
    new CommandOption({
      name: 'date',
      description: "User's birthday (MM/DD)",
      required: true,
      type: CommandOptionType.STRING,
    }),
    new CommandOption({
      name: 'user',
      description: 'User',
      required: false,
      type: CommandOptionType.USER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const targetBirthday = ctx.getArgument<string>('date') as string;
    const requestor = ctx.interaction.member?.user;
    const requestorId = requestor?.id;
    const targetUserId = ctx.getArgument<string>('user') as string;

    const targetUser = await getTargetUser(ctx, requestorId, targetUserId);

    const dayOfYear = calculateDayOfYear(targetBirthday);

    if (!dayOfYear || typeof dayOfYear !== 'number') {
      return ctx.respondWithError(`Invalid birthday`);
    }

    if (targetUser) {
      if (!(await userHasBirthday(ctx, guildId, targetUser.id))) {
        const birthday = await setBirthday(
          ctx,
          guildId,
          dayOfYear,
          targetUser.id,
        );

        if (birthday) {
          return ctx.respondWithMessage(
            `Birthday (${targetBirthday}) set for ${targetUser.username}#${targetUser.discriminator}`,
          );
        }

        return ctx.respondWithError(`Unable to set birthday`);
      }

      return ctx.respondWithError(
        `A birthday is already set for ${targetUser.username}#${targetUser.discriminator}`,
      );
    }
  },
});

export default set;
