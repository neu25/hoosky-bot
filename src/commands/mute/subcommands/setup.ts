import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { Config } from '../../../database';
import { MUTED_PERMISSIONS } from '../index';
import { RolesConfig } from '../../../repository';

const setup = new SubCommand({
  name: 'setup',
  displayName: 'Mute Setup',
  description: 'Sets up the muted role and appropriate channel permissions',
  requiredPermissions: [
    Discord.Permission.MANAGE_ROLES,
    Discord.Permission.MANAGE_CHANNELS,
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();

    // Respond with a loader, as this command may take longer time on large servers.
    ctx.interactionApi.respondLater().catch(err => {
      throw err;
    });

    // Fetch the role configuration from the database.
    let rolesCfg = await ctx.config().get<RolesConfig>(guildId, Config.ROLES);

    const createMutedRole = async (): Promise<RolesConfig> => {
      // No roles saved yet, create new ones.
      const mutedRole = await ctx.api.createGuildRole(guildId, {
        name: 'Muted',
        permissions: '0',
      });

      const newRolesCfg = {
        muted: mutedRole.id,
        focusHard: rolesCfg?.focusHard ?? '',
        focusSoft: rolesCfg?.focusSoft ?? '',
      };

      // Update the `roles` configuration value.
      await ctx.config().update(guildId, Config.ROLES, newRolesCfg);

      return newRolesCfg;
    };

    if (!rolesCfg || !rolesCfg.muted) {
      // Create the `muted` role since none was saved.
      rolesCfg = await createMutedRole();
    } else {
      // Make sure the saved `muted` role is still in the server.
      const roles = await ctx.api.getGuildRoles(guildId);
      if (!roles.find(r => r.id === rolesCfg?.muted)) {
        // Cannot find `muted` role, so create a new one and save it.
        rolesCfg = await createMutedRole();
      }
    }

    const channels = await ctx.api.getGuildChannels(guildId);
    for (const c of channels) {
      // Only apply the permission overwrite to the following channel types.
      if (
        ![
          Discord.ChannelType.GUILD_CATEGORY,
          Discord.ChannelType.GUILD_TEXT,
        ].includes(c.type)
      ) {
        continue;
      }

      await ctx.api.editChannelPermissions(c.id, rolesCfg.muted!, {
        allow: MUTED_PERMISSIONS.allow,
        deny: MUTED_PERMISSIONS.deny,
        type: 0,
      });
    }

    await ctx.interactionApi.editResponse({
      content: 'Successfully set up the muted role',
    });
  },
});

export default setup;
