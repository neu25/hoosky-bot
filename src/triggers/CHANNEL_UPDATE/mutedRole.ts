import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { Config, RolesConfig } from '../../database';
import { Permission } from '../../Discord';

const mutedRole = new Trigger<Discord.Event.CHANNEL_UPDATE>({
  event: Discord.Event.CHANNEL_UPDATE,
  handler: async ctx => {
    const data = ctx.getData();

    if (!data.guild_id) {
      throw new Error('No guild ID found in trigger data');
    }

    const rolesCfg = await ctx.db.getConfigValue<RolesConfig>(
      data.guild_id,
      Config.ROLES,
    );
    if (!rolesCfg) {
      throw new Error('No roles configuration found');
    }

    // Check whether the channel permission overwrites are acceptable.
    // Specifically, make sure the `muted` role is denied the `SEND_MESSAGES`
    // permission.
    let acceptable: boolean | null = null;
    if (data.permission_overwrites) {
      for (const o of data.permission_overwrites) {
        if (o.id === rolesCfg.muted) {
          acceptable =
            o.allow === '0' && o.deny === String(Permission.SEND_MESSAGES);
          break;
        }
      }
    }

    // We need to fix the channel overrides.
    if (acceptable !== null && !acceptable) {
      await ctx.api.editChannelPermissions(data.id, rolesCfg.muted, {
        allow: '0',
        deny: String(Permission.SEND_MESSAGES),
        type: 0,
      });
    }
  },
});

export default mutedRole;
