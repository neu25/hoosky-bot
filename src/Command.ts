import ExecutionContext from './ExecutionContext';
import * as Discord from './Discord';
import { NewCommand } from './Discord';

type CommandOptions = {
  handler: (ctx: ExecutionContext) => Promise<void>;
} & Discord.NewCommand;

/**
 * Command represents a command supported by the Hoosky bot. Use this
 * constructor to add new commands to the bot.
 */
class Command {
  private readonly _opts: CommandOptions;

  constructor(opts: CommandOptions) {
    this._opts = opts;
  }

  /**
   * Executes the command with an execution context, which is provided by
   * the Discord client answering the command.
   *
   * @param ctx The execution context.
   */
  execute(ctx: ExecutionContext): Promise<void> {
    return this._opts.handler(ctx);
  }

  /**
   * Serialized the command to a JSON representation understood by the Discord
   * API. It simply removes the JavaScript handler from the command options.
   */
  serialize(): NewCommand {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { handler, ...serialized } = this._opts;
    return serialized;
  }
}

export default Command;
