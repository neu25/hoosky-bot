import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { setstarboard } from '../../commands/starboard';

/*
this only works for star emojis for now, ideally we will have multiple boards with multiple emojis and minstars
*/
const starboard = new Trigger<Discord.Event.MESSAGE_REACTION_ADD>({
  event: Discord.Event.MESSAGE_REACTION_ADD,
  handler: async ctx => {
    const minstars = 1; //1 for now, ideally will get this value from setstarboard
    //get information about the reaction
    const data = ctx.getData();
    console.log('a message has been starred'); //DEBUG, write data of reaction in console

    if (data.emoji.name === '⭐') {
      //get array of users who reacted with a star
      const reactions = await ctx.api.getReactions(
        data.message_id,
        data.channel_id,
        data.emoji.name,
      );

      if (reactions.length >= minstars) {
        // TODO
      }
    }
  },
});

export default starboard;
