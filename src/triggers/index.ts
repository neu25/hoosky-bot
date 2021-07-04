import CHANNEL_UPDATE from './CHANNEL_UPDATE';
import GUILD_CREATE from './GUILD_CREATE';
import GUILD_ROLE_DELETE from './GUILD_ROLE_DELETE';
import GUILD_MEMBER_UPDATE from './GUILD_MEMBER_UPDATE';

const triggers = [
  ...CHANNEL_UPDATE,
  ...GUILD_CREATE,
  ...GUILD_ROLE_DELETE,
  ...GUILD_MEMBER_UPDATE,
];

export default triggers;
