import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { Config, RolesConfig } from '../../database';
import { MUTED_PERMISSIONS } from '../../commands/mute';

const mutedRole = new Trigger<Discord.Event.CHANNEL_UPDATE>({
  event: Discord.Event.CHANNEL_UPDATE,
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

    // Check whether the channel permission overwrites are acceptable.
    // Specifically, make sure the `muted` role is denied the permissions in
    // `MUTED_DENY_PERMISSIONS`.
    let acceptable: boolean | null = null;
    if (data.permission_overwrites) {
      for (const o of data.permission_overwrites) {
        if (o.id === rolesCfg.muted) {
          acceptable =
            o.allow === MUTED_PERMISSIONS.allow &&
            o.deny === MUTED_PERMISSIONS.deny;
          break;
        }
      }
    }

    // We need to fix the channel overrides.
    if (acceptable !== null && !acceptable) {
      await ctx.api.editChannelPermissions(data.id, rolesCfg.muted, {
        allow: MUTED_PERMISSIONS.allow,
        deny: MUTED_PERMISSIONS.deny,
        type: 0,
      });
    }
  },
});

export default mutedRole;
