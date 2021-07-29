import SubCommand from '../../../SubCommand';
import * as Discord from '../../../Discord';

const list = new SubCommand({
  name: 'list',
  displayName: 'Poll List',
  description: 'List your active polls and their IDs',
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const userId = ctx.mustGetUserId();
    const polls = await (
      await ctx.polls().getAllByUserId(guildId, userId)
    )
      .sort({
        question: 1,
      })
      .toArray();

    const embedFields: Discord.EmbedField[] = polls.map(p => ({
      name: p.question,
      value: `ID: ${p._id}`,
    }));

    const embed: Discord.Embed = {
      title: 'Your active polls',
      type: Discord.EmbedType.RICH,
      color: Discord.Color.PRIMARY,
      fields: embedFields,
    };
    if (embedFields.length < 1) {
      embed.description = 'You don’t have any active polls.';
    }

    return ctx.interactionApi.respondWithEmbed(embed);
  },
});

export default list;
