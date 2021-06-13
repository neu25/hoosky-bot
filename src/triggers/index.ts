import * as Discord from '../Discord';
import CHANNEL_UPDATE from './CHANNEL_UPDATE';
import GUILD_CREATE from './GUILD_CREATE';

const triggers = {
  [Discord.Event.CHANNEL_UPDATE]: CHANNEL_UPDATE,
  [Discord.Event.GUILD_CREATE]: GUILD_CREATE,
};

export default triggers;
