import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { Config, RolesConfig } from '../../database';

const mutedRole = new Trigger<Discord.Event.GUILD_CREATE>({
  event: Discord.Event.GUILD_CREATE,
  handler: async ctx => {
    const data = ctx.getData();

    let rolesCfg = await ctx.db.getConfigValue<RolesConfig>(
      data.id,
      Config.ROLES,
    );

    const createMutedRole = async (): Promise<RolesConfig> => {
      // No roles saved yet, create new ones.
      const mutedRole = await ctx.api.createGuildRole(data.id, {
        name: 'Muted',
        permissions: '0',
      });

      const newRolesCfg = {
        muted: mutedRole.id,
      };

      // Update the `roles` configuration value.
      await ctx.db.updateConfigValue(data.id, Config.ROLES, newRolesCfg);

      return newRolesCfg;
    };

    if (!rolesCfg) {
      // Create the `muted` role since none was saved.
      rolesCfg = await createMutedRole();
    } else {
      // Make sure the saved `muted` role is still in the server.
      const roles = await ctx.api.getGuildRoles(data.id);
      if (!roles.find(r => r.id === rolesCfg?.muted)) {
        // Cannot find `muted` role, so create a new one and save it.
        rolesCfg = await createMutedRole();
      }
    }

    if (data.channels) {
      for (const c of data.channels) {
        await ctx.api.editChannelPermissions(c.id, rolesCfg.muted, {
          allow: String(0),
          deny: String(Discord.Permission.SEND_MESSAGES),
          type: 0,
        });
      }
    }
  },
});

export default mutedRole;
