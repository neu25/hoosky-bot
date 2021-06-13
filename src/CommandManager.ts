import { AxiosInstance } from 'axios';
import * as Discord from './Discord';
import Command from './Command';
import { performRequest } from './utils';

/**
 * `CommandManager` creates and deletes Hoosky bot commands appropriately to
 * ensure the latest changes are reflected.
 */
class CommandManager {
  private readonly _client: AxiosInstance;
  private readonly _appId: string;

  constructor(appId: string, client: AxiosInstance) {
    this._appId = appId;
    this._client = client;
  }

  /**
   * Overrides all guild commands with the provided set of commands.
   *
   * @param guildIds The IDs of guilds to sync commands with.
   * @param commands The set of commands to use.
   */
  async syncGuildCommands(
    guildIds: string[],
    commands: Record<string, Command>,
  ): Promise<void> {
    for (const gId of guildIds) {
      await this._bulkOverwriteGuildCommands(
        gId,
        Object.values(commands).map(c => c.serialize()),
      );
    }
  }

  /**
   * Gets a list of all global commandManager.
   */
  private _getGlobalCommands(): Promise<Discord.Command[]> {
    return performRequest(async () => {
      const res = await this._client.get(
        `applications/${this._appId}/commandManager`,
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
  private _createGlobalCommand(command: Discord.NewCommand): Promise<void> {
    return performRequest(async () => {
      await this._client.post(
        `applications/${this._appId}/commandManager`,
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
  private _bulkOverwriteGlobalCommands(
    commands: Discord.NewCommand[],
  ): Promise<void> {
    return performRequest(async () => {
      await this._client.put(`applications/${this._appId}/commands`, commands);
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
      await this._client.delete(`applications/${this._appId}/commands/${id}`);
    });
  }

  /**
   * Gets a list of all guild commandManager.
   *
   * @param guildId The ID of the guild.
   */
  private _getGuildCommands(guildId: string): Promise<Discord.Command[]> {
    return performRequest(async () => {
      const res = await this._client.get(
        `applications/${this._appId}/guilds/${guildId}/commands`,
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
  private _createGuildCommand(
    guildId: string,
    command: Discord.NewCommand,
  ): Promise<void> {
    return performRequest(async () => {
      await this._client.post(
        `applications/${this._appId}/guilds/${guildId}/commands`,
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
  private _bulkOverwriteGuildCommands(
    guildId: string,
    commands: Discord.NewCommand[],
  ): Promise<Discord.Command[]> {
    return performRequest(async () => {
      const res = await this._client.put(
        `applications/${this._appId}/guilds/${guildId}/commands`,
        commands,
      );
      return res.data as Discord.Command[];
    });
  }

  getClient(): AxiosInstance {
    return this._client;
  }
}

export default CommandManager;
