import * as Discord from '../../Discord';
import Trigger from '../../Trigger';

const starboard = new Trigger<Discord.Event.MESSAGE_REACTION_ADD>({
  event: Discord.Event.MESSAGE_REACTION_ADD,
  handler: ctx => {
    const data = ctx.getData();
    console.log(data);
  },
});

export default starboard;
