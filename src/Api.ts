import axios, { AxiosInstance } from 'axios';
import * as Discord from './Discord';
import { performRequest } from './utils';

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

  constructor(appId: string, token: string) {
    this._appId = appId;
    this._client = axios.create({
      baseURL: 'https://discord.com/api/v8',
      headers: {
        Authorization: `Bot ${token}`,
      },
    });
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
}

export default Api;
