import * as Discord from './Discord';
import { CommandHandler, FollowUpHandler } from './SubCommand';
import SubCommandGroup, { SubCommandGroupProps } from './SubCommandGroup';
import ExecutionContext from './ExecutionContext';

type CommandProps = {
  default_permission?: boolean;
  permissions?: Discord.CommandPermission[];
  handler?: CommandHandler;
  followUpHandlers?: Record<string, FollowUpHandler>;
} & SubCommandGroupProps;

/**
 * Command represents a command supported by the Hoosky bot. Use this
 * constructor to add new commands to the bot.
 */
class Command extends SubCommandGroup {
  readonly followUpHandlers: Record<string, FollowUpHandler>;
  private readonly _handler?: CommandHandler;
  private readonly _defaultPerm: boolean;

  constructor(props: CommandProps) {
    const { handler, default_permission, followUpHandlers, ...base } = props;
    super(base);
    this._handler = handler;
    this._defaultPerm = default_permission ?? true;
    this.followUpHandlers = followUpHandlers ?? {};
  }

  /**
   * Executes the command with an execution context, which is provided by
   * the Discord client answering the command.
   *
   * @param ctx The execution context.
   */
  execute(ctx: ExecutionContext): unknown | Promise<unknown> {
    if (this._handler) {
      // Supply this command's follow-up handlers.
      ctx._setFollowUpHandlers(this.followUpHandlers);
      return this._handler(ctx);
    }

    ctx._advanceCommand();

    super.execute(ctx);
  }

  /**
   * Serializes the command to a JSON representation understood by the Discord
   * API. It simply removes the JavaScript handler from the command options.
   */
  serialize(): any {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type, ...serialized } = super.serialize();
    return {
      default_permission: this._defaultPerm,
      ...serialized,
    };
  }
}

export default Command;
