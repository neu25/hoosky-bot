import Interaction from '../../Interaction';

const reply = new Interaction({
  id: 'mail-delete-thread',
  handler: async ctx => {
    const { interaction } = ctx;
    // Delete the Discord channel. This triggers the `CHANNEL_DELETE` event, which
    // automatically deletes the mail thread entry in the database.
    await ctx.api.deleteChannel(interaction.channel_id!);
  },
});

export default reply;
