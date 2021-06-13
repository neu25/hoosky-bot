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
  private readonly _cmd: string[];
  private _cmdIndex: number;
  private readonly _args: Arguments;
  private readonly _client: AxiosInstance;

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

  respondWithError(content: string): Promise<void> {
    return this.respondWithMessage(`Unable to run command: ${content}`, true);
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
  async deleteFollowUp(messageId: string): Promise<void> {
    await performRequest(() =>
      this._client.delete(
        `/webhooks/${this._appId}/${this.interaction.token}/messages/${messageId}`,
      ),
    );
  }

  /**
   * Helper method to prepare the emoji for requests
   *
   * @param emojiString The emoji string
   */
  private _prepareEmoji(emojiString: string): string {
    // checks if the emoji is custom and if it is, it will trim it
    // example:
    //  - from: <:test2:850478323712131073>
    //  - to: <:test2:850478323712131073>
    return encodeURI(emojiString.split('<:').join('').split('>').join(''));
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
        `/channels/${channelId}/messages/${messageId}/reactions/${this._prepareEmoji(
          emojiString,
        )}/@me`,
      ),
    );
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
        `/channels/${channelId}/messages/${messageId}/reactions/${this._prepareEmoji(
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
          emojiString == null ? '' : `/${this._prepareEmoji(emojiString)}`
        }`,
      ),
    );
  }

  /**
   * Fetches all the users that reacted to a message
   *
   * @param messageId The message ID of the message.
   * @param channelId The channel ID of the channel.
   * @param emoji The emoji string of the reaction.
   */
  getReactions(
    messageId: string,
    channelId: string,
    emojiString: string,
  ): Promise<Discord.User[]> {
    return performRequest(async () => {
      const res = await this._client.get(
        `/channels/${channelId}/messages/${messageId}/reactions/${this._prepareEmoji(
          emojiString,
        )}`,
      );
      return res.data;
    });
  }
}

export default ExecutionContext;
