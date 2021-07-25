import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import {
  fetchCoursePages,
  constructSubjectEmbedFromPage,
  constructSubjectSelectFromPages,
} from '../_common';
import { italics } from '../../../format';

const listAll = new SubCommand({
  name: 'list-all',
  displayName: 'List All Courses',
  description: 'Lists all available courses',
  handler: async ctx => {
    const { interaction } = ctx;
    const channelId = interaction.channel_id!;

    const pages = await fetchCoursePages(ctx);
    if (pages.length === 0) {
      return ctx.interactionApi.respondSilentlyWithEmbed({
        type: Discord.EmbedType.RICH,
        description: 'No courses were found',
      });
    }

    await ctx.interactionApi.respondWithMessage(
      'Here is a page of the course list:',
    );

    return ctx.api.createMessage(channelId, {
      content: italics('Course not listed here? Please suggest it!'),
      components: [
        {
          type: Discord.MessageComponentType.ActionRow,
          components: [constructSubjectSelectFromPages(pages)],
        },
      ],
      embeds: [constructSubjectEmbedFromPage(pages[0], pages.length)],
    });
  },
});

export default listAll;
