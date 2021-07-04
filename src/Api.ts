import axios, { AxiosInstance } from 'axios';
import * as Discord from './Discord';
import Cache from './Cache';
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
  private readonly _http: AxiosInstance;
  private readonly _cache: Cache;

  constructor(appId: string, http: AxiosInstance, cache: Cache) {
    this._appId = appId;
    this._http = http;
    this._cache = cache;
  }

  /**
   * Gets a list of the guilds the bot currently resides in.
   */
  async getCurrentGuilds(): Promise<Discord.Guild[]> {
    const cached = Api._tryCache('current guilds', () =>
      this._cache.getGuilds(),
    );
    if (cached) return cached;

    return performRequest(async () => {
      const res = await this._http.get(
        'https://discord.com/api/v8/users/@me/guilds',
      );
      const guilds = res.data as Discord.Guild[];
      this._cache._replaceGuilds(guilds);
      return guilds;
    });
  }

  /**
   * Gets a list of roles in the guild.
   *
   * @param guildId The ID of the guild.
   */
  async getGuildRoles(guildId: string): Promise<Discord.Role[]> {
    const cached = Api._tryCache('guild roles', () =>
      this._cache.getGuildRoles(guildId),
    );
    if (cached) return cached;

    return performRequest(async () => {
      const res = await this._http.get(`/guilds/${guildId}/roles`);
      const roles = res.data as Discord.Role[];
      this._cache._replaceGuildRoles(guildId, roles);
      return roles;
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
      const res = await this._http.post(`/guilds/${guildId}/roles`, data);
      const role = res.data as Discord.Role;
      this._cache._updateGuildRole(guildId, role);
      return role;
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
      const res = await this._http.patch(`/guilds/${guildId}/roles`, {
        id: roleId,
        position,
      });
      const roles = res.data as Discord.Role[];
      this._cache._replaceGuildRoles(guildId, roles);
      return roles;
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
      const res = await this._http.patch(
        `/guilds/${guildId}/roles/${roleId}`,
        data,
      );
      const role = res.data as Discord.Role;
      this._cache._updateGuildRole(guildId, role);
      return role;
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
      await this._http.delete(`/guilds/${guildId}/roles/${roleId}`);
      this._cache._deleteGuildRole(guildId, roleId);
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
      await this._http.put(
        `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      );
      this._cache._addRoleToGuildMember(guildId, userId, roleId);
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
      await this._http.delete(
        `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      );
      this._cache._removeRoleFromGuildMember(guildId, userId, roleId);
    });
  }

  /**
   * Gets a list of all the channels in the guild.
   *
   * @param guildId The ID of the guild.
   */
  async getGuildChannels(guildId: string): Promise<Discord.Channel[]> {
    const cached = Api._tryCache('guild channels', () =>
      this._cache.getGuildChannels(guildId),
    );
    if (cached) return cached;

    return performRequest(async () => {
      const res = await this._http.get(`/guilds/${guildId}/channels`);
      const channels = res.data as Discord.Channel[];
      this._cache._replaceChannels(guildId, channels);
      return channels;
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
  async getGuildMember(
    guildId: string,
    userId: string,
  ): Promise<Discord.GuildMember> {
    const cached = Api._tryCache('guild member', () =>
      this._cache.getGuildMember(guildId, userId),
    );
    if (cached) return cached;

    return performRequest(async () => {
      const res = await this._http.get(`/guilds/${guildId}/members/${userId}`);
      const member = res.data as Discord.GuildMember;
      this._cache._updateGuildMember(guildId, member);
      return member;
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
      const res = await this._http.get(`/users/${userId}`);
      return res.data;
    });
  }

  /**
   * Sends a message in the specified channel.
   *
   * @param channelId The ID of the channel.
   * @param data The content of the message.
   */
  createMessage(
    channelId: string,
    data: Discord.CreateMessagePayload,
  ): Promise<Discord.Message> {
    return performRequest(async () => {
      const res = await this._http.post(
        `/channels/${channelId}/messages`,
        data,
      );
      return res.data as Discord.Message;
    });
  }

  /**
   * TODO: Work in progress.
   */
  // createMessageWithFile(
  //   channelId: string,
  //   fileName: string,
  //   data: Discord.CreateMessagePayload & { file: File },
  // ): Promise<Discord.Message> {
  //   const { file, ...payload } = data;
  //
  //   const formData = new FormData();
  //   formData.append('file', file, fileName);
  //   formData.append('payload_json', JSON.stringify(payload));
  //
  //   return performRequest(async () => {
  //     const res = await this._http.post(
  //       `/channels/${channelId}/messages`,
  //       formData,
  //     );
  //     return res.data as Discord.Message;
  //   });
  // }

  /**
   * Sends an error message in the specified channel.
   *
   * @param channelId The ID of the channel.
   * @param content The error message.
   */
  createErrorMessage(
    channelId: string,
    content: string,
  ): Promise<Discord.Message> {
    return this.createMessage(channelId, { content: `Error: ${content}` });
  }

  /**
   * Replies to a message with an error message in the specified channel.
   *
   * @param channelId The ID of the channel.
   * @param messageId The ID of the message to reply to.
   * @param content The error message.
   */
  createErrorReply(
    channelId: string,
    messageId: string,
    content: string,
  ): Promise<Discord.Message> {
    return this.createMessage(channelId, {
      content: `Error: ${content}`,
      message_reference: {
        message_id: messageId,
      },
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
  ): Promise<void> {
    return performRequest(async () => {
      await this._http.put(
        `/channels/${channelId}/permissions/${overwriteId}`,
        overwrite,
      );
      this._cache._updateChannelPermissions(channelId, {
        ...overwrite,
        id: overwriteId,
      });
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
      await this._http.put(
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
   * @param userId The id of the user. (If ommitted deletes the reaction made by the bot)
   */
  async deleteUserReaction(
    messageId: string,
    channelId: string,
    emojiString: string,
    userId?: number,
  ): Promise<void> {
    const target = userId == null ? '@me' : userId.toString();
    await performRequest(() =>
      this._http.delete(
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
   * @param emojiString The emoji string of the reaction. (if ommitted deletes all emojis)
   */
  async deleteAllReactions(
    messageId: string,
    channelId: string,
    emojiString?: string,
  ): Promise<void> {
    await performRequest(() =>
      this._http.delete(
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
      const res = await this._http.get(
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
      this._http.put(
        `/channels/${channelId}/messages/${messageId}/reactions/${prepareEmoji(
          emojiString,
        )}/@me`,
      ),
    );
  }

  /**
   * Edits a message
   *
   * @param messageId The message ID of the message.
   * @param channelId The channel ID of the channel.
   * @param content The message contents (up to 2000 characters)
   * @param embeds Array of embedded rich content (up to 6000 characters total)
   * @param embed Embedded rich content, deprecated in favor of embeds
   * @param flags Edit the flags of a message (only SUPPRESS_EMBEDS can currently be set/unset)
   * @param payload_json JSON encoded body of non-file params (multipart/form-data only)
   * @param allowed_mentions Allowed mentions for the message
   * @param attachments Array of attached files to keep
   * @param components Array of components to include in the message
   */
  async editMessage(
    //https://discord.com/developers/docs/resources/channel#edit-message
    messageId: string,
    channelId: string,
    content?: string,
    embeds?: Discord.Embed[],
    embed?: Discord.Embed, // deprecated...
    flags?: number,
    /* file?: to be implemented...,*/
    payload_json?: string,
    allowed_mentions?: Discord.AllowedMentions,
    attachments?: Discord.Attachment[],
    components?: Discord.MessageComponent[],
  ): Promise<void> {
    await performRequest(() =>
      this._http.patch(`/channels/${channelId}/messages/${messageId}`, {
        content: content,
        embeds: embeds,
        embed: embed,
        flags: flags,
        payload_json: payload_json,
        allowed_mentions: allowed_mentions,
        attachments: attachments,
        components: components,
      }),
    );
  }

  /**
   * Deletes a message
   *
   * @param messageId The message ID of the message.
   * @param channelId The channel ID of the channel.
   */
  async deleteMessage(messageId: string, channelId: string): Promise<void> {
    await performRequest(() =>
      this._http.delete(`/channels/${channelId}/messages/${messageId}`),
    );
  }

  /**
   * Gets a list of all global commandManager.
   */
  getGlobalCommands(): Promise<Discord.Command[]> {
    return performRequest(async () => {
      const res = await this._http.get(
        `/applications/${this._appId}/commandManager`,
      );
      return res.data;
    });
  }

  /**
   * Creates a new global command, overwriting any existing command with the
   * same name.
   *
   * Takes up to 1 hour to propagate to all guilds.
   *
   * @param command The command to be created.
   */
  createGlobalCommand(command: Discord.NewCommand): Promise<void> {
    return performRequest(async () => {
      await this._http.post(
        `/applications/${this._appId}/commandManager`,
        command,
      );
    });
  }

  /**
   * Replaces all global commandManager with the provided list of commandManager.
   *
   * Takes up to 1 hour to propagate to all guilds.
   *
   * @param commands The commands to use.
   */
  bulkOverwriteGlobalCommands(commands: Discord.NewCommand[]): Promise<void> {
    return performRequest(async () => {
      await this._http.put(`/applications/${this._appId}/commands`, commands);
    });
  }

  /**
   * Deletes the global command with the given id.
   *
   * Takes up to 1 hour to propagate to all guilds.
   *
   * @param id The ID of the command.
   */
  deleteGlobalCommand(id: string): Promise<void> {
    return performRequest(async () => {
      await this._http.delete(`/applications/${this._appId}/commands/${id}`);
    });
  }

  /**
   * Gets a list of all guild commandManager.
   *
   * @param guildId The ID of the guild.
   */
  getGuildCommands(guildId: string): Promise<Discord.Command[]> {
    return performRequest(async () => {
      const res = await this._http.get(
        `/applications/${this._appId}/guilds/${guildId}/commands`,
      );
      return res.data;
    });
  }

  /**
   * Creates a new guild command.
   *
   * @param guildId The ID of the guild.
   * @param command The command to be created.
   */
  createGuildCommand(
    guildId: string,
    command: Discord.NewCommand,
  ): Promise<void> {
    return performRequest(async () => {
      await this._http.post(
        `/applications/${this._appId}/guilds/${guildId}/commands`,
        command,
      );
    });
  }

  /**
   * Replaces all guild commandManager with the provided list of commandManager.
   *
   * @param guildId The ID of the guild.
   * @param commands The set of commands to use.
   */
  bulkOverwriteGuildCommands(
    guildId: string,
    commands: Discord.NewCommand[],
  ): Promise<Discord.Command[]> {
    return performRequest(async () => {
      const res = await this._http.put(
        `/applications/${this._appId}/guilds/${guildId}/commands`,
        commands,
      );
      return res.data as Discord.Command[];
    });
  }

  download(url: string): Promise<string> {
    return performRequest(async () => {
      const res = await axios.get(url, { responseType: 'text' });
      return res.data as string;
    });
  }

  private static _tryCache<R>(
    key: string,
    fn: () => R | undefined,
  ): R | undefined {
    const cached = fn();
    if (cached) {
      console.log(`[Cache] HIT on ${key}`);
      return cached;
    }
    console.log(`[Cache] MISS on ${key}`);
  }
}

export default Api;
