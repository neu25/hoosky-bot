import * as Discord from '../Discord';
import CHANNEL_UPDATE from './CHANNEL_UPDATE';
import GUILD_CREATE from './GUILD_CREATE';
import MESSAGE_REACTION_ADD from './MESSAGE_REACTION_ADD';

const triggers = {
  [Discord.Event.CHANNEL_UPDATE]: CHANNEL_UPDATE,
  [Discord.Event.GUILD_CREATE]: GUILD_CREATE,
  [Discord.Event.MESSAGE_REACTION_ADD]: MESSAGE_REACTION_ADD,
};

export default triggers;
