import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import {setstarboard} from '../../commands/starboard';

/*
this only works for star emojis for now, ideally we will have multiple boards with multiple emojis and minstars
*/
const starboard = new Trigger<Discord.Event.MESSAGE_REACTION_ADD>({
  event: Discord.Event.MESSAGE_REACTION_ADD,
  handler: async ctx => {
    //const boardsInfo = setstarboard.getBoardInfo() //doesn't work yet
    const minstars = 1; //1 for now, ideally will get this value from setstarboard
    //get information about the reaction
    const data = ctx.getData();
    console.log(data);
    if (data.emoji.name === '⭐') {
      //get array of users who reacted with a star
      const reactions = await ctx.api.getReactions(
        data.message_id,
        data.channel_id,
        data.emoji.name,
      );
      //get message content
      const msg = await ctx.api.getChannelMessage(data.channel_id, data.message_id);
      console.log(msg) //DEBUG
      //fields for Embed 
      const fields: Discord.EmbedField[] = [{
        name: data.member!.nick!,
        value: msg.content,
      }]
      // const boardEmbed: Discord.Embed = {
      //     title: "",
      //     fields,
      // };
      const boardMsg: Discord.CreateMessage = {
        content: `${data.emoji.name} ${reactions.length} | <#${data.channel_id}> | <@${data.user_id}>`, 
        //embeds: [boardEmbed], 
      };

      if (reactions.length >= minstars) {
        await ctx.api.createMessage("854880840085536798", boardMsg); //this is my own starboard channel's id
        //TODO: get starboard channel id from commands/starboard/setstarboard
      }
    }
  },
});

export default starboard;
