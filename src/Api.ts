import { AxiosInstance } from 'axios';
import * as Discord from './Discord';
import { performRequest, prepareEmoji } from './utils';

export type GuildRoleData = {
  name?: string;
  permissions?: string;
  color?: number;
  hoist?: boolean;
  mentionable?: boolean;
};

class Api {
  private readonly _appId: string;
  private readonly _client: AxiosInstance;

  constructor(appId: string, client: AxiosInstance) {
    this._appId = appId;
    this._client = client;
  }

  /**
   * Gets a list of the guilds the bot currently resides in.
   */
  getCurrentGuilds(): Promise<Discord.Guild[]> {
    return performRequest(async () => {
      const res = await this._client.get(
        'https://discord.com/api/v8/users/@me/guilds',
      );
      return res.data;
    });
  }

  /**
   * Gets a list of roles in the guild.
   *
   * @param guildId The ID of the guild.
   */
  getGuildRoles(guildId: string): Promise<Discord.Role[]> {
    return performRequest(async () => {
      const res = await this._client.get(`/guilds/${guildId}/roles`);
      return res.data as Discord.Role[];
    });
  }

  /**
   * Creates a role in the guild.
   *
   * @param guildId The ID of the guild.
   * @param data Options for the new role.
   */
  createGuildRole(guildId: string, data: GuildRoleData): Promise<Discord.Role> {
    return performRequest(async () => {
      const res = await this._client.post(`/guilds/${guildId}/roles`, data);
      return res.data as Discord.Role;
    });
  }

  /**
   * Modifies the position of the guild role so that certain roles are ranked
   * higher than others.
   *
   * @param guildId The ID of the guild.
   * @param roleId The ID of the role.
   * @param position The new position of the role. A higher position means a
   * higher rank, with `@everyone` starting at position 0.
   */
  modifyGuildRolePosition(
    guildId: string,
    roleId: string,
    position: number,
  ): Promise<Discord.Role[]> {
    return performRequest(async () => {
      const res = await this._client.patch(`/guilds/${guildId}/roles`, {
        id: roleId,
        position,
      });
      return res.data as Discord.Role[];
    });
  }

  /**
   * Updates the guild role using the provided data.
   *
   * @param guildId The ID of the guild.
   * @param roleId The ID of the role to update.
   * @param data The update data.
   */
  modifyGuildRole(
    guildId: string,
    roleId: string,
    data: GuildRoleData,
  ): Promise<Discord.Role> {
    return performRequest(async () => {
      const res = await this._client.patch(
        `/guilds/${guildId}/roles/${roleId}`,
        data,
      );
      return res.data as Discord.Role;
    });
  }

  /**
   * Deletes a guild role.
   *
   * @param guildId The ID of the guild.
   * @param roleId The ID of the role.
   */
  deleteGuildRole(guildId: string, roleId: string): Promise<void> {
    return performRequest(async () => {
      await this._client.delete(`/guilds/${guildId}/roles/${roleId}`);
    });
  }

  /**
   * Assigns a role to a member. Note that the bot can only assign roles that
   * are lower than its rank.
   *
   * @param guildId The ID of the guild.
   * @param userId The ID of the user receiving the role.
   * @param roleId The ID of the role.
   */
  addRoleToMember(
    guildId: string,
    userId: string,
    roleId: string,
  ): Promise<void> {
    return performRequest(async () => {
      await this._client.put(
        `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      );
    });
  }

  /**
   * Removes a role from a member. Note that the bot can only remove roles that
   * are lower than its rank.
   *
   * @param guildId The ID of the guild.
   * @param userId The ID of the user losing the role.
   * @param roleId The ID of the role.
   */
  removeRoleFromMember(
    guildId: string,
    userId: string,
    roleId: string,
  ): Promise<void> {
    return performRequest(async () => {
      await this._client.delete(
        `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      );
    });
  }

  /**
   * Gets information about the specified guild member.
   *
   * Note: This method differs from `getUser` because it provides guild-specific
   * information (e.g., permissions).
   *
   * @param guildId The ID of the guild in which the user resides.
   * @param userId The ID of the user.
   */
  getGuildMember(
    guildId: string,
    userId: string,
  ): Promise<Discord.GuildMember> {
    return performRequest(async () => {
      const res = await this._client.get(
        `/guilds/${guildId}/members/${userId}`,
      );
      return res.data;
    });
  }

  /**
   * Gets information about the specified user.
   *
   * Note: This method differs from `getGuildMember` because it provides global
   * user information that doesn't include guild-specific data (e.g., user tag).
   *
   * @param userId The ID of the user.
   */
  getUser(userId: string): Promise<Discord.User> {
    return performRequest(async () => {
      const res = await this._client.get(`/users/${userId}`);
      return res.data;
    });
  }

  /**
   * Edits the permissions of the channel by setting the provided overwrites.
   *
   * @param channelId The ID of the channel.
   * @param overwriteId The ID of the user or role whose permissions will be
   * overwritten.
   * @param overwrite The permission overwrite.
   */
  editChannelPermissions(
    channelId: string,
    overwriteId: string,
    overwrite: Omit<Discord.Overwrite, 'id'>,
  ) {
    return performRequest(async () => {
      await this._client.put(
        `/channels/${channelId}/permissions/${overwriteId}`,
        overwrite,
      );
    });
  }

  /**
   * Edits the permissions of a bot command, allowing/deny the specified
   * users/roles from executing the command.
   *
   * If the entity is denied from executing the command, it will not show up
   * in the command list UI.
   *
   * @param guildId The ID of the guild.
   * @param commandId The ID of the command.
   * @param permissions The permissions of hte command.
   */
  editCommandPermissions(
    guildId: string,
    commandId: string,
    permissions: Discord.CommandPermission[],
  ): Promise<void> {
    return performRequest(async () => {
      await this._client.put(
        `/applications/${this._appId}/guilds/${guildId}/commands/${commandId}/permissions`,
        permissions,
      );
    });
  }

  /**
   * Deletes a reaction made by an user or by the bot
   *
   * @param messageId The message ID of the message.
   * @param channelId The channel ID of the channel.
   * @param emojiString The emoji string of the reaction.
   * @param userId? The id of the user. If ommitted it will delete the reaction made by the bot.
   */
  async deleteUserReaction(
    messageId: string,
    channelId: string,
    emojiString: string,
    userId?: number,
  ): Promise<void> {
    const target = userId == null ? '@me' : userId.toString();
    await performRequest(() =>
      this._client.delete(
        `/channels/${channelId}/messages/${messageId}/reactions/${prepareEmoji(
          emojiString,
        )}/${target}`,
      ),
    );
  }

  /**
   * Deletes all reactions on a message for an emoji or all emojis
   *
   * @param messageId The message ID of the message.
   * @param channelId The channel ID of the channel.
   * @param emojiString? The emoji string of the reaction.
   */
  async deleteAllReactions(
    messageId: string,
    channelId: string,
    emojiString?: string,
  ): Promise<void> {
    await performRequest(() =>
      this._client.delete(
        `/channels/${channelId}/messages/${messageId}/reactions${
          emojiString == null ? '' : `/${prepareEmoji(emojiString)}`
        }`,
      ),
    );
  }

  /**
   * Fetches all the users that reacted to a message
   *
   * @param messageId The message ID of the message.
   * @param channelId The channel ID of the channel.
   * @param emojiString The emoji string of the reaction.
   */
  getReactions(
    messageId: string,
    channelId: string,
    emojiString: string,
  ): Promise<Discord.User[]> {
    return performRequest(async () => {
      const res = await this._client.get(
        `/channels/${channelId}/messages/${messageId}/reactions/${prepareEmoji(
          emojiString,
        )}`,
      );
      return res.data;
    });
  }

  /**
   * Creates a reaction to a message
   *
   * @param messageId The message ID of the message.
   * @param channelId The channel ID of the channel.
   * @param emojiString The emoji string of the reaction.
   */
  async createReaction(
    messageId: string,
    channelId: string,
    emojiString: string,
  ): Promise<void> {
    await performRequest(() =>
      this._client.put(
        `/channels/${channelId}/messages/${messageId}/reactions/${prepareEmoji(
          emojiString,
        )}/@me`,
      ),
    );
  }
}

export default Api;
