import * as Discord from './Discord';
import SubCommand, { CommandHandler } from './SubCommand';
import SubCommandGroup, { SubCommandGroupProps } from './SubCommandGroup';
import ExecutionContext from './ExecutionContext';
import { MessageFollowUpHandler } from './FollowUpManager';

type CommandProps = {
  displayName: string;
  default_permission?: boolean;
  permissions?: Discord.CommandPermission[];
  handler?: CommandHandler;
  msgFollowUpHandlers?: Record<string, MessageFollowUpHandler>;
  requiredPermissions?: Discord.Permission[];
} & SubCommandGroupProps;

/**
 * Command represents a command supported by the Hoosky bot. Use this
 * constructor to add new commands to the bot.
 */
class Command extends SubCommandGroup {
  readonly displayName: string;
  readonly msgFollowUpHandlers: Record<string, MessageFollowUpHandler>;
  readonly requiredPerms: Discord.Permission[];
  readonly defaultPerm: boolean;
  readonly handler?: CommandHandler;

  constructor(props: CommandProps) {
    const {
      requiredPermissions,
      displayName,
      handler,
      default_permission,
      msgFollowUpHandlers,
      ...base
    } = props;
    super(base);
    this.displayName = displayName;
    this.msgFollowUpHandlers = msgFollowUpHandlers ?? {};
    this.handler = handler;
    this.defaultPerm = default_permission ?? true;
    this.requiredPerms = requiredPermissions ?? [];
  }

  /**
   * Executes the command with an execution context, which is provided by
   * the Discord client answering the command.
   *
   * @param ctx The execution context.
   */
  async execute(ctx: ExecutionContext): Promise<unknown> {
    if (
      !(await SubCommand.checkPermissions(
        ctx,
        this.displayName,
        this.requiredPerms,
      ))
    ) {
      return;
    }

    if (this.handler) {
      // Supply this command's follow-up handlers.
      ctx.msgFollowUpHandlers = this.msgFollowUpHandlers;
      return this.handler(ctx);
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
      default_permission: this.defaultPerm,
      ...serialized,
    };
  }
}

export default Command;
