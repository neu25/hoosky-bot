import SubCommand from '../../../SubCommand';

const list = new SubCommand({
  name: 'list',
  displayName: 'List',
  description: 'Lists all of your active polls and gives you their ids',
  handler: async ctx => {
    ctx.interactionApi.respondWithMessage('list');
  },
});

export default list;
