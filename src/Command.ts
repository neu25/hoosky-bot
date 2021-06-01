import { CommandHandler } from './SubCommand';
import SubCommandGroup, { SubCommandGroupProps } from './SubCommandGroup';
import ExecutionContext from './ExecutionContext';

type CommandOptions = {
  handler?: CommandHandler;
} & SubCommandGroupProps;

/**
 * Command represents a command supported by the Hoosky bot. Use this
 * constructor to add new commands to the bot.
 */
class Command extends SubCommandGroup {
  private readonly _handler?: CommandHandler;

  constructor(options: CommandOptions) {
    const { handler, ...base } = options;
    super(base);
    this._handler = handler;
  }

  /**
   * Executes the command with an execution context, which is provided by
   * the Discord client answering the command.
   *
   * @param ctx The execution context.
   */
  execute(ctx: ExecutionContext): void | Promise<void> {
    if (this._handler) {
      return this._handler(ctx);
    }

    console.log(JSON.stringify(ctx.getInteraction(), null, 2));

    ctx.advanceCommand();

    super.execute(ctx);
  }

  /**
   * Serializes the command to a JSON representation understood by the Discord
   * API. It simply removes the JavaScript handler from the command options.
   */
  serialize(): any {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type, ...serialized } = super.serialize();
    return serialized;
  }
}

export default Command;
