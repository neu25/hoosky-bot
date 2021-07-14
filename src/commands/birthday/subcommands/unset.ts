import SubCommand from '../../../SubCommand';

export const unset = new SubCommand({
  name: 'unset',
  displayName: 'Unset Birthday',
  description: 'Unset your birthday',
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const requester = ctx.interaction.member?.user;

    if (!requester || !requester.id) {
      return ctx.interactionApi.respondWithError(`Unable to identify you`);
    }

    if (!(await ctx.birthdays().exists(guildId, requester.id))) {
      return ctx.interactionApi.respondWithError(
        `There is no birthday set for <@${requester.id}>`,
      );
    }

    await ctx.birthdays().unset(guildId, requester.id);
    return ctx.interactionApi.respondWithMessage(
      `Birthday unset for <@${requester.id}>`,
    );
  },
});

export default unset;
