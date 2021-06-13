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

  getCurrentGuilds(): Promise<Discord.Guild[]> {
    return performRequest(async () => {
      const res = await this._client.get(
        'https://discord.com/api/v8/users/@me/guilds',
      );
      return res.data;
    });
  }

  getGuildRoles(guildId: string): Promise<Discord.Role[]> {
    return performRequest(async () => {
      const res = await this._client.get(`/guilds/${guildId}/roles`);
      return res.data as Discord.Role[];
    });
  }

  createGuildRole(guildId: string, data: GuildRoleData): Promise<Discord.Role> {
    return performRequest(async () => {
      const res = await this._client.post(`/guilds/${guildId}/roles`, data);
      return res.data as Discord.Role;
    });
  }

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

  deleteGuildRole(guildId: string, roleId: string): Promise<void> {
    return performRequest(async () => {
      await this._client.delete(`/guilds/${guildId}/roles/${roleId}`);
    });
  }

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

  getUser(userId: string): Promise<Discord.User> {
    return performRequest(async () => {
      const res = await this._client.get(`/users/${userId}`);
      return res.data;
    });
  }

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
