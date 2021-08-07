import Interaction from '../../Interaction';
import {
  fetchCoursePages,
  constructSubjectEmbedFromPage,
} from '../../commands/course/_common';

const openPage = new Interaction({
  id: 'courses-open-page',
  handler: async ctx => {
    const { interaction } = ctx;
    const { data } = interaction;
    if (!data?.values || data.values.length !== 1) {
      throw new Error(`Unexpected interaction data values: ${data?.values}`);
    }

    // Parse the desired page ID.
    const pageId = parseInt(data.values[0], 10);
    const pages = await fetchCoursePages(ctx);

    const desiredPage = pages[pageId];

    await ctx.interactionApi.updateMessage({
      embeds: [constructSubjectEmbedFromPage(desiredPage, pages.length)],
    });
  },
});

export default openPage;
