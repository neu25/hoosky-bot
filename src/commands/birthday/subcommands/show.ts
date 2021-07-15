import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CommandOptionType } from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { getTargetUser } from '../_common';
import { bold } from '../../../format';

dayjs.extend(relativeTime);

export const show = new SubCommand({
  name: 'show',
  displayName: 'Show Birthday',
  description: 'Show a user’s birthday',
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
    const requesterId = ctx.mustGetUserId();
    const targetUserId = ctx.getArgument<string>('user')!;

    const targetUser = await getTargetUser(
      ctx,
      guildId,
      requesterId,
      targetUserId,
    );

    if (!targetUser || !targetUser.user?.id) {
      return ctx.interactionApi.respondWithError(
        `Unable to identify the requested user`,
      );
    }

    const birthday = await ctx
      .birthdays()
      .getByUserId(guildId, targetUser.user.id);
    if (birthday) {
      const currentYear = dayjs().format('YYYY');
      const date = dayjs(`${birthday._id}/${currentYear}`);

      let userString;
      if (targetUser.nick) {
        userString = targetUser.nick;
        userString += ` (${targetUser.user.username}#${targetUser.user.discriminator})`;
      } else {
        userString = `${targetUser.user.username}#${targetUser.user.discriminator}`;
      }

      return ctx.interactionApi.respondWithMessage(
        `${bold(userString + `’s`)} birthday is on ${bold(
          dayjs(date).format('MMMM D'),
        )} (${dayjs(date).fromNow()})`,
      );
    } else {
      return ctx.interactionApi.respondWithError(
        `There is no birthday set for <@${targetUser.user.id}>`,
      );
    }
  },
});

export default show;
