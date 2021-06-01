import * as Discord from './Discord';
import SubCommandGroup, { SubCommandGroupProps } from './SubCommandGroup';
import ExecutionContext from './ExecutionContext';

export type CommandHandler = (ctx: ExecutionContext) => void | Promise<void>;

export type SubCommandOptions = {
  handler: CommandHandler;
} & SubCommandGroupProps;

/**
 * `SubCommand` represents a command that is a child of a parent `Command`.
 *
 * It must be used for all non-top-level commands, and it is placed within a
 * the `options` property of a `Command` or `CommandGroup`. The siblings of
 * `SubCommand` in said property must also be `SubCommand`s.
 *
 * `SubCommand` inherits from `SubCommandGroup`, with the only difference being
 * that `SubCommand` is a leaf node and possesses a `handler`.
 */
class SubCommand extends SubCommandGroup {
  private readonly _handler: CommandHandler;

  constructor(opts: SubCommandOptions) {
    const { handler, ...base } = opts;
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
    return this._handler(ctx);
  }

  /**
   * Serializes the command option to a JSON representation understood by the
   * Discord API.
   */
  serialize(): any {
    return {
      ...super.serialize(),
      type: Discord.CommandOptionType.SUB_COMMAND,
    };
  }
}

export default SubCommand;
