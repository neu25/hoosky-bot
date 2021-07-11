import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { Config } from '../../../database';
import { FOCUS_HARD_PERMISSIONS, FOCUS_SOFT_PERMISSIONS } from '../index';
import { RolesConfig } from '../../../repository';

const setup = new SubCommand({
  name: 'setup',
  displayName: 'Focus Mode Setup',
  description:
    'Sets up the focus mode roles and appropriate channel permissions',
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

    const createFocusHardRole = async (): Promise<RolesConfig> => {
      // No roles saved yet, create new ones.
      const focusHardRole = await ctx.api.createGuildRole(guildId, {
        name: 'Focus (Hard)',
        permissions: '0',
      });

      const newRolesCfg = {
        muted: rolesCfg?.muted ?? '',
        focusHard: focusHardRole.id,
        focusSoft: rolesCfg?.focusSoft ?? '',
      };

      // Update the `roles` configuration value.
      await ctx.config().update(guildId, Config.ROLES, newRolesCfg);

      return newRolesCfg;
    };

    const createFocusSoftRole = async (): Promise<RolesConfig> => {
      // No roles saved yet, create new ones.
      const focusSoftRole = await ctx.api.createGuildRole(guildId, {
        name: 'Focus (Soft)',
        permissions: '0',
      });

      const newRolesCfg = {
        muted: rolesCfg?.muted ?? '',
        focusHard: rolesCfg?.focusHard ?? '',
        focusSoft: focusSoftRole.id,
      };

      // Update the `roles` configuration value.
      await ctx.config().update(guildId, Config.ROLES, newRolesCfg);

      return newRolesCfg;
    };

    if (!rolesCfg || !rolesCfg.focusHard || !rolesCfg.focusSoft) {
      // Create the `focusHard` role since none was saved.
      rolesCfg = await createFocusHardRole();
      // Create the `focusSoft` role since none was saved.
      rolesCfg = await createFocusSoftRole();
    } else {
      // Make sure the saved `focusHard` role is still in the server.
      const roles = await ctx.api.getGuildRoles(guildId);
      if (!roles.find(r => r.id === rolesCfg?.focusHard)) {
        // Cannot find `focusHard` role, so create a new one and save it.
        rolesCfg = await createFocusHardRole();
      }

      // Make sure the saved `focusSoft` role is still in the server.
      if (!roles.find(r => r.id === rolesCfg?.focusSoft)) {
        // Cannot find `focusSoft` role, so create a new one and save it.
        rolesCfg = await createFocusSoftRole();
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

      await ctx.api.editChannelPermissions(c.id, rolesCfg.focusHard!, {
        allow: FOCUS_HARD_PERMISSIONS.allow,
        deny: FOCUS_HARD_PERMISSIONS.deny,
        type: 0,
      });
      await ctx.api.editChannelPermissions(c.id, rolesCfg.focusSoft!, {
        allow: FOCUS_SOFT_PERMISSIONS.allow,
        deny: FOCUS_SOFT_PERMISSIONS.deny,
        type: 0,
      });
    }

    await ctx.interactionApi.editResponse({
      content: 'Successfully set up the Focus roles',
    });
  },
});

export default setup;
