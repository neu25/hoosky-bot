import * as Discord from '../Discord';
import CHANNEL_UPDATE from './CHANNEL_UPDATE';
import GUILD_CREATE from './GUILD_CREATE';
import GUILD_ROLE_DELETE from './GUILD_ROLE_DELETE';
import GUILD_MEMBER_UPDATE from './GUILD_MEMBER_UPDATE';

const triggers = {
  [Discord.Event.CHANNEL_UPDATE]: CHANNEL_UPDATE,
  [Discord.Event.GUILD_CREATE]: GUILD_CREATE,
  [Discord.Event.GUILD_ROLE_DELETE]: GUILD_ROLE_DELETE,
  [Discord.Event.GUILD_MEMBER_UPDATE]: GUILD_MEMBER_UPDATE,
};

export default triggers;
