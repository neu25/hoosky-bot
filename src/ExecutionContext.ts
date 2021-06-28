import { AxiosInstance } from 'axios';
import * as Discord from './Discord';
import Snowflake from './Snowflake';
import { Repositories } from './repository';
import { performRequest } from './utils';
import { parseCommand, OptionType, Arguments } from './arguments';
import Api from './Api';
import CourseRepo from './repository/CourseRepo';
import ConfigRepo from './repository/ConfigRepo';
import FollowUpManager from './FollowUpManager';
import { FollowUpHandler } from './SubCommand';

export type ExecutionContextOpts = {
  appId: string;
  repos: Repositories;
  interaction: Discord.Interaction;
  client: AxiosInstance;
  api: Api;
  followUpManager: FollowUpManager;
};

/**
 * ExecutionContext is a helper class with a straightforward interface for
 * handling commands.
 *
 * With ExecutionContext, you can respond to a command execution in several
 * ways, such as replying to the message.
 *
 * It is passed as an argument to the command handler function, and it provides
 * all the necessary information about the executed command.
 *
 * For more information about possible responses to an Interaction, see
 * https://discord.com/developers/docs/interactions/slash-commands#responding-to-an-interaction.
 */
class ExecutionContext {
  readonly api: Api;
  readonly repos: Repositories;
  readonly interaction: Discord.Interaction;
  private _followUpHandlers: Record<string, FollowUpHandler>;
  private readonly _appId: string;
  private readonly _args: Arguments;
  private readonly _client: AxiosInstance;
  private readonly _followUpManager: FollowUpManager;

  // For internal use.
  private readonly _cmd: string[];
  private _cmdIndex: number;

  constructor(opts: ExecutionContextOpts) {
    this.api = opts.api;
    this.repos = opts.repos;
    this.interaction = opts.interaction;
    this._appId = opts.appId;
    this._cmdIndex = 0;
    this._client = opts.client;
    this._followUpManager = opts.followUpManager;
    this._followUpHandlers = {};

    if (opts.interaction.data) {
      const { command, args } = parseCommand(opts.interaction.data);
      this._cmd = command;
      this._args = args;
    } else {
      this._args = {};
      this._cmd = [];
    }
  }

  courses(): CourseRepo {
    return this.repos.courses;
  }

  config(): ConfigRepo {
    return this.repos.config;
  }

  /**
   * Retrieves the argument of the provided name. If no argument with the name
   * is found, it returns `undefined`.
   *
   * @param name The name of the argument.
   */
  getArgument<T extends OptionType>(name: string): T | undefined {
    return this._args[name] as T;
  }

  /**
   * Retrieves the guild ID of the current interaction. If none is included,
   * it throws an error.
   */
  mustGetGuildId(): string {
    const guildId = this.interaction.guild_id;
    if (!guildId) {
      throw new Error('No guild ID found in interaction');
    }
    return guildId;
  }

  mustGetUserId(): string {
    const userId = this.interaction.member?.user?.id;
    if (!userId) {
      throw new Error('No user ID found in interaction');
    }
    return userId;
  }

  /**
   * Returns the date of the command execution.
   */
  interactionDate(): Date {
    return new Snowflake(this.interaction.id).getDate();
  }

  /**
   * Primes the follow-up handler with the provided ID for the user who executed the command.
   * Thus, the user's next message will trigger the follow-up handler.
   *
   * @param userId The ID of the user to listen to.
   * @param followUpId The ID of the handler in the `followUpHandlers` map.
   * @param ttl The number of milliseconds to keep the follow-up listener open. (Default: 10,000ms).
   */
  expectFollowUp(userId: string, followUpId: string, ttl?: number): void {
    const handler = this._followUpHandlers[followUpId];
    if (!handler) {
      throw new Error(`No follow-up handler with ID ${followUpId}`);
    }
    this._followUpManager.addPendingFollowUp({
      handler,
      userId,
      ectx: this,
      expires: Date.now() + (ttl ?? 10000),
    });
  }

  /**
   * Un-primes the follow-up handler for the provided user ID.
   * This means that the user's messages will no longer be treated as follow-ups.
   *
   * @param userId The ID of the user to un-listen to.
   */
  unexpectFollowUp(userId: string): void {
    this._followUpManager.removePendingFollowUp(userId);
  }

  /**
   * Responds to the command execution with the provided InteractionResponse.
   * Usually, you don't need to access this low-level method. See if
   * `respondWithMessage` or `respondLater` achieve what you want.
   *
   * @param res The raw interaction response.
   */
  respond(res: Discord.InteractionResponse): Promise<void> {
    return performRequest(async () => {
      await this._client.post(
        `/interactions/${this.interaction.id}/${this.interaction.token}/callback`,
        res,
      );
    });
  }

  /**
   * Responds to the command execution with the provided message.
   *
   * @param content The content of the message.
   * @param ephemeral If true, only the user who executed the command can see the
   * response. The response also disappears after a period of time.
   */
  respondWithMessage(content: string, ephemeral?: boolean): Promise<void> {
    const data: Discord.InteractionCommandCallbackData = { content };
    if (ephemeral) {
      data.flags = 64;
    }

    return this.respond({
      type: Discord.InteractionCallbackType.ChannelMessageWithSource,
      data,
    });
  }

  /**
   * Responds to the command execution with an embed.
   *
   * This is a convenience method for calling `respondWithEmbeds` with a single
   * embed.
   *
   * @param embed The Discord embed.
   * @param ephemeral If true, only the user who executed the command can see the
   * response. The response also disappears after a period of time.
   */
  respondWithEmbed(embed: Discord.Embed, ephemeral?: boolean): Promise<void> {
    return this.respondWithEmbeds([embed], ephemeral);
  }

  /**
   * Responds to the command execution with an embed only visible to the message
   * executor.
   *
   * This is a convenience method for calling `respondWithEmbed` with `ephemeral`
   * set to true.
   *
   * @param embed The Discord embed.
   */
  respondSilentlyWithEmbed(embed: Discord.Embed): Promise<void> {
    return this.respondWithEmbed(embed, true);
  }

  /**
   * Responds to the command execution with one of more embeds.
   *
   * @param embeds An array of Discord embeds.
   * @param ephemeral If true, only the user who executed the command can see the
   * response. The response also disappears after a period of time.
   */
  respondWithEmbeds(
    embeds: Discord.Embed[],
    ephemeral?: boolean,
  ): Promise<void> {
    const data: Discord.InteractionCommandCallbackData = { embeds };
    if (ephemeral) {
      data.flags = 64;
    }

    return this.respond({
      type: Discord.InteractionCallbackType.ChannelMessageWithSource,
      data,
    });
  }

  /**
   * Responds to the command execution with an error message only visible to the
   * executor. The error message is prefixed with "Unable to run command: ".
   *
   * @param content The error message.
   */
  respondWithError(content: string): Promise<void> {
    return this.respondWithMessage(`Unable to run command: ${content}`, true);
  }

  /**
   * Responds to the command execution with a message only visible to the executor.
   * @param content The content of the message.
   */
  respondSilently(content: string): Promise<void> {
    return this.respondWithMessage(content, true);
  }

  /**
   * Responds to the command execution with a loading status. `editResponse`
   * should be called later to update the initial response message.
   */
  respondLater(): Promise<void> {
    return this.respond({
      type: Discord.InteractionCallbackType.DeferredChannelMessageWithSource,
    });
  }

  /**
   * Returns our response to the command execution. This is only relevant if
   * `respond` has already been called.
   */
  getResponse(): Promise<Discord.Message> {
    return performRequest(async () => {
      const res = await this._client.get(
        `/webhooks/${this._appId}/${this.interaction.token}/messages/@original`,
      );
      return res.data;
    });
  }

  /**
   * Edits our original response to the command execution.
   *
   * @param edit The message edit.
   */
  editResponse(edit: Discord.MessageEdit): Promise<Discord.Message> {
    return this.editFollowUp('@original', edit);
  }

  /**
   * Deletes our original response to the command execution.
   */
  deleteResponse(): Promise<void> {
    return this.deleteFollowUp('@original');
  }

  /**
   * Sends a follow-up message on top of the initial interaction response.
   *
   * @param data The follow-up message data.
   */
  followUp(data: Discord.FollowUpMessage): Promise<Discord.Message> {
    return performRequest(async () => {
      const res = await this._client.post(
        `/webhooks/${this._appId}/${this.interaction.token}`,
        data,
      );
      return res.data;
    });
  }

  /**
   * Follows-up with the initial interaction response with the provided message.
   *
   * @param msg The follow-up text message.
   */
  followUpWithMessage(msg: string): Promise<Discord.Message> {
    return this.followUp({ content: msg });
  }

  /**
   * Follows-up with the initial interaction with the provided error message.
   *
   * @param msg The follow-up text message.
   */
  followUpWithError(msg: string): Promise<Discord.Message> {
    return this.followUpWithMessage(`Error: ${msg}`);
  }

  /**
   * Edits a follow-up message.
   *
   * @param messageId The message ID of the follow-up.
   * @param edit The message edits.
   */
  editFollowUp(
    messageId: string,
    edit: Discord.MessageEdit,
  ): Promise<Discord.Message> {
    return performRequest(async () => {
      const res = await this._client.patch(
        `/webhooks/${this._appId}/${this.interaction.token}/messages/${messageId}`,
        edit,
      );
      return res.data;
    });
  }

  /**
   * Deletes a follow-up message.
   *
   * @param messageId The message ID of the follow-up.
   */
  deleteFollowUp(messageId: string): Promise<void> {
    return performRequest(
      async () =>
        await this._client.delete(
          `/webhooks/${this._appId}/${this.interaction.token}/messages/${messageId}`,
        ),
    );
  }

  _setFollowUpHandlers(handlers: Record<string, FollowUpHandler>): void {
    this._followUpHandlers = handlers;
  }

  /**
   * Returns the current command name being processed.
   *
   * NOTE: This is for internal use in matching the command with the respective
   * handler. There are currently no use cases for this method, as the command
   * name is obvious within each command handler.
   */
  _getCurrentCommand(): string {
    if (this._cmdIndex >= this._cmd.length) {
      return '';
    }
    return this._cmd[this._cmdIndex];
  }

  /**
   * Advances the current command name being processed.
   *
   * NOTE: This is for internal use in matching the command with the respective
   * handler. There are currently no use cases for this method, as the command
   * name is obvious within each command handler.
   */
  _advanceCommand(): string {
    const current = this._getCurrentCommand();
    this._cmdIndex++;
    return current;
  }
}

export default ExecutionContext;
