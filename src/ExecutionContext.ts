import * as Discord from './Discord';
import Snowflake from './Snowflake';
import { parseCommand, OptionType, Arguments } from './arguments';
import Client from './Client';
import BaseContext, { BaseContextOpts } from './BaseContext';
import InteractionApi from './InteractionApi';

export type ExecutionContextOpts = {
  interactionApi: InteractionApi;
  interaction: Discord.Interaction;
  client: Client;
} & BaseContextOpts;

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
class ExecutionContext extends BaseContext {
  readonly interactionApi: InteractionApi;
  readonly interaction: Discord.Interaction;
  readonly client: Client;
  private readonly _args: Arguments;

  // For internal use.
  private readonly _cmd: string[];
  private _cmdIndex: number;

  constructor(opts: ExecutionContextOpts) {
    super(opts);
    this.interactionApi = opts.interactionApi;
    this.interaction = opts.interaction;
    this.client = opts.client;
    this._cmdIndex = 0;

    if (opts.interaction.data) {
      const { command, args } = parseCommand(opts.interaction.data);
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
   * @param followUpId The ID of the handler in the `followUpHandlers` map.
   * @param channelId The ID of the channel to listen in.
   * @param messageId The ID of the message being followed up on.
   * @param userId The ID of the user to listen to.
   * @param ttl?? The number of milliseconds to keep the follow-up listener open. (Default: 10,000ms).
   */
  expectMessageFollowUp(
    followUpId: string,
    channelId: string,
    messageId: string,
    userId: string,
    ttl = 30000,
  ): void {
    const handler = this.msgFollowUpHandlers[followUpId];
    if (!handler) {
      throw new Error(`No follow-up handler with ID ${followUpId}`);
    }
    this._followUpManager.addMsgFollowUp({
      handler,
      userId,
      channelId,
      messageId,
      ectx: this,
      expires: Date.now() + ttl,
    });
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
