import SubCommand from '../../../SubCommand';
import * as Discord from '../../../Discord';

const list = new SubCommand({
  name: 'list',
  displayName: 'List',
  description: 'Lists all of your active polls and gives you their ids',
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const userId = ctx.mustGetUserId();
    const polls = (await ctx.poll().getAllByUserId(guildId, userId)).sort({
      question: 1,
    });

    const embedFields: Discord.EmbedField[] = [];

    let p = await polls.next();
    while (p !== null) {
      console.log(p.question);

      embedFields.push({
        name: p.question,
        value: `ID: ${p._id}`,
      });

      p = await polls.next();
    }

    const embed: Discord.Embed = {
      title: 'Your active polls',
      type: Discord.EmbedType.RICH,
      color: Discord.Color.PRIMARY,
      fields: embedFields,
    };

    if (embedFields === []) {
      embed.description = "You don't have any active polls";
    }

    ctx.interactionApi.respondWithEmbeds([embed], true);
  },
});

export default list;
