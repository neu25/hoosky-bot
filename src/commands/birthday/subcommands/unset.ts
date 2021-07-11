import SubCommand from '../../../SubCommand';

export const unset = new SubCommand({
  name: 'unset',
  displayName: 'Unset Birthday',
  description: 'Unset your birthday',
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const requestor = ctx.interaction.member?.user;

    if (!requestor || !requestor.id) {
      return ctx.interactionApi.respondWithError(`Unable to identify you`);
    }

    if (!(await ctx.birthdays().exists(guildId, requestor.id))) {
      return ctx.interactionApi.respondWithError(
        `There is no birthday set for <@${requestor.id}>`,
      );
    }

    await ctx.birthdays().unset(guildId, requestor.id);
    return ctx.interactionApi.respondWithMessage(
      `Birthday unset for <@${requestor.id}>`,
    );
  },
});

export default unset;
