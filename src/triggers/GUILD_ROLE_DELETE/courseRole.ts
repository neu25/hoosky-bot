import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { Config } from '../../database';
import { RolesConfig } from '../../repository';

const courseRole = new Trigger<Discord.Event.GUILD_ROLE_DELETE>({
  event: Discord.Event.GUILD_ROLE_DELETE,
  handler: async ctx => {
    const data = ctx.getData();
    if (!data.guild_id) {
      throw new Error('No guild ID found in trigger data');
    }

    const rolesCfg = await ctx
      .config()
      .get<RolesConfig>(data.guild_id, Config.ROLES);
    if (!rolesCfg) {
      throw new Error('No roles configuration found');
    }
    if (!rolesCfg.muted) {
      return;
    }
  },
});

export default courseRole;
