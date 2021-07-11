import Command from '../Command';

const ping = new Command({
  name: 'ping',
  displayName: 'Ping',
  description: 'Responds with "pong"',
  handler: async ctx => {
    const startTime = ctx.interactionDate();

    await ctx.interactionApi.respondWithMessage('pong');

    const msg = await ctx.interactionApi.getResponse();
    const endTime = new Date(msg.timestamp);
    const latency = endTime.getTime() - startTime.getTime();

    await ctx.interactionApi.editResponse({
      content: `pong (latency: ${latency}ms)`,
    });
  },
});

export default ping;
