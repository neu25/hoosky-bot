import { AxiosInstance } from 'axios';
import * as Discord from './Discord';
import Snowflake from './Snowflake';
import { performRequest } from './utils';
import { parseCommand, OptionType, Arguments } from './arguments';
import { Database } from './database';
import Api from './Api';

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
  readonly db: Database;
  readonly interaction: Discord.Interaction;
  private readonly _appId: string;
  private readonly _args: Arguments;
  private readonly _client: AxiosInstance;

  // For internal use.
  private readonly _cmd: string[];
  private _cmdIndex: number;

  constructor(
    appId: string,
    database: Database,
    interaction: Discord.Interaction,
    client: AxiosInstance,
  ) {
    this.api = new Api(appId, client);
    this.db = database;
    this.interaction = interaction;
    this._appId = appId;
    this._cmdIndex = 0;
    this._client = client;

    if (interaction.data) {
      const { command, args } = parseCommand(interaction.data);
      this._cmd = command;
      this._args = args;
    } else {
      this._args = {};
      this._cmd = [];
    }
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
    if (!this.interaction.guild_id) {
      throw new Error('No guild ID found in interaction');
    }
    return this.interaction.guild_id;
  }

  /**
   * Returns the date of the command execution.
   */
  interactionDate(): Date {
    return new Snowflake(this.interaction.id).getDate();
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
    return this.respondSilently(`Unable to run command: ${content}`);
  }

  /**
   * Responds to the command execution with an message only visible to the executor.
   * @param content The content of the message.
   */
  respondSilently(content: string): Promise<void> {
    return this.respondSilently(content);
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
   * @param msg The follow-up message.
   */
  followUp(msg: Discord.FollowUpMessage): Promise<Discord.Message> {
    return performRequest(async () => {
      const res = await this._client.post(
        `/webhooks/${this._appId}/${this.interaction.token}`,
        msg,
      );
      return res.data;
    });
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

  /**
   * Returns the current command name being processed.
   *
   * NOTE: This is for internal use in matching the command with the respective
   * handler. There are currently no use cases for this method, as the command
   * name is obvious within each command handler.
   */
  getCurrentCommand(): string {
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
  advanceCommand(): string {
    const current = this.getCurrentCommand();
    this._cmdIndex++;
    return current;
  }
}

export default ExecutionContext;
