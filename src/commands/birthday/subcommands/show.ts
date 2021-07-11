import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CommandOptionType } from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { getTargetUser } from '../_common';
import { bold } from '../../../format';

dayjs.extend(dayOfYear, relativeTime);

export const show = new SubCommand({
  name: 'show',
  displayName: 'Show Birthday',
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

    if (!targetUser || !targetUser.id) {
      return ctx.interactionApi.respondWithError(
        `Unable to identify the requested user`,
      );
    }

    const birthday = await ctx.birthdays().getByUserId(guildId, targetUser.id);

    if (birthday) {
      const date = dayjs().dayOfYear(await birthday._id);

      return ctx.interactionApi.respondWithMessage(
        `Birthday for <@${targetUser.id}> is set to ${bold(
          dayjs(date).format('dddd, MMMM D, YYYY'),
        )} (${dayjs(date).fromNow()})`,
      );
    } else {
      return ctx.interactionApi.respondWithError(
        `There is no birthday set for <@${targetUser.id}>`,
      );
    }
  },
});

export default show;
