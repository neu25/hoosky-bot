import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import {setstarboard} from '../../commands/starboard';
import Boards from '../../commands/starboard/_Boards'
//THESE ARE FOR DEBUGGING
import { boolean } from 'yargs';
var debug: boolean = false;
/** 
* TO DO:
* be able to store board info without resetting when bot restarts
* update board message when there's a new reaction instead of sending a new message
* include files in starboard message
* (extra) include replied messages in starboard message
*/
const starboard = new Trigger<Discord.Event.MESSAGE_REACTION_ADD>({
  event: Discord.Event.MESSAGE_REACTION_ADD,
  handler: async ctx => {
    //get information about the reaction
    const data = ctx.getData();
    //check if the emoji is one of the designated emojis for theboards
    if (Boards.boardEmojis.includes(data.emoji.name)) {
      const idx = Boards.boardEmojis.indexOf(data.emoji.name);
      const minstars = Boards.boardMins[idx];
      const channelId = Boards.boardIDs[idx];
      //get array of users who reacted with a star
      const reactions = await ctx.api.getReactions(
        data.message_id,
        data.channel_id,
        data.emoji.name,
      );
      //get message content
      const msg = await ctx.api.getChannelMessage(data.channel_id, data.message_id);
      const sender = await ctx.api.getGuildMember(data.guild_id!, msg.author!.id!)
      if(debug){console.log(msg)};
      //check if the user has a nickname
      var userNick = ""
      if(sender.nick == null){
        userNick = sender.user!.username;
      }
      else{
        userNick = sender.nick!;
      }
      //fields for Embed 
      const fields: Discord.EmbedField[] = [{
        name: userNick,
        value: msg.content,
      }]
      const boardEmbed: Discord.Embed = {
          title: "",
          fields,
      };
      const boardMsg: Discord.CreateMessage = {
        content: `${data.emoji.name} ${reactions.length} | <#${data.channel_id}> | <@${msg.author.id}>`, 
        embeds: [boardEmbed], 
      };

      if (reactions.length >= minstars) {
        await ctx.api.createMessage(channelId, boardMsg); 
      }
    }
  },
});

export default starboard;
