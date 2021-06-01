import axios, { AxiosInstance } from 'axios';
import * as Discord from './Discord';
import Command from './Command';
import { performRequest } from './utils';

/**
 * `CommandManager` creates and deletes Hoosky bot commands appropriately to
 * ensure the latest changes are reflected.
 */
class CommandManager {
  private readonly _client: AxiosInstance;

  constructor(appId: string, token: string) {
    this._client = axios.create({
      baseURL: `https://discord.com/api/v8/applications/${appId}`,
      headers: {
        Authorization: `Bot ${token}`,
      },
    });
  }

  /**
   * Overrides all guild commands with the provided set of commands.
   *
   * @param guildId The ID of the guild.
   * @param commands The set of commands to use.
   */
  async syncGuildCommands(
    guildId: string,
    commands: Record<string, Command>,
  ): Promise<void> {
    await this._bulkOverwriteGuildCommands(
      guildId,
      Object.values(commands).map(c => c.serialize()),
    );
  }

  /**
   * Gets a list of all global commandManager.
   */
  private _getGlobalCommands(): Promise<Discord.Command[]> {
    return performRequest(async () => {
      const res = await this._client.get('/commandManager');
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
  private _createGlobalCommand(command: Discord.NewCommand): Promise<void> {
    return performRequest(async () => {
      await this._client.post('/commandManager', command);
    });
  }

  /**
   * Replaces all global commandManager with the provided list of commandManager.
   *
   * Takes up to 1 hour to propagate to all guilds.
   *
   * @param commands The commands to use.
   */
  private _bulkOverwriteGlobalCommands(
    commands: Discord.NewCommand[],
  ): Promise<void> {
    return performRequest(async () => {
      await this._client.put(`/commands`, commands);
    });
  }

  /**
   * Deletes the global command with the given id.
   *
   * Takes up to 1 hour to propagate to all guilds.
   *
   * @param id The ID of the command.
   */
  private _deleteGlobalCommand(id: string): Promise<void> {
    return performRequest(async () => {
      await this._client.delete(`/commands/${id}`);
    });
  }

  /**
   * Gets a list of all guild commandManager.
   *
   * @param guildId The ID of the guild.
   */
  private _getGuildCommands(guildId: string): Promise<Discord.Command[]> {
    return performRequest(async () => {
      const res = await this._client.get(`/guilds/${guildId}/commands`);
      return res.data;
    });
  }

  /**
   * Creates a new guild command.
   *
   * @param guildId The ID of the guild.
   * @param command The command to be created.
   */
  private _createGuildCommand(
    guildId: string,
    command: Discord.NewCommand,
  ): Promise<void> {
    return performRequest(async () => {
      await this._client.post(`/guilds/${guildId}/commands`, command);
    });
  }

  /**
   * Replaces all guild commandManager with the provided list of commandManager.
   *
   * @param guildId The ID of the guild.
   * @param commands The set of commands to use.
   */
  private _bulkOverwriteGuildCommands(
    guildId: string,
    commands: Discord.NewCommand[],
  ): Promise<void> {
    return performRequest(async () => {
      await this._client.put(`/guilds/${guildId}/commands`, commands);
    });
  }
}

export default CommandManager;
