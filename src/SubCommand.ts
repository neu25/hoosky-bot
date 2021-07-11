import * as Discord from './Discord';
import SubCommandGroup, { SubCommandGroupProps } from './SubCommandGroup';
import ExecutionContext from './ExecutionContext';
import { bold } from './format';
import { checkCtxPermissions } from './commands/_utils';
import { MessageFollowUpHandler } from './FollowUpManager';

export type CommandHandler = (
  ctx: ExecutionContext,
) => unknown | Promise<unknown>;

export type SubCommandOptions = {
  handler: CommandHandler;
  msgFollowUpHandlers?: Record<string, MessageFollowUpHandler>;
  displayName: string;
  requiredPermissions?: Discord.Permission[];
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
  readonly displayName: string;
  readonly msgFollowUpHandlers: Record<string, MessageFollowUpHandler>;
  readonly requiredPerms: Discord.Permission[];
  readonly handler: CommandHandler;

  constructor(opts: SubCommandOptions) {
    const {
      handler,
      requiredPermissions,
      displayName,
      msgFollowUpHandlers,
      ...base
    } = opts;
    super(base);
    this.displayName = displayName;
    this.msgFollowUpHandlers = msgFollowUpHandlers ?? {};
    this.handler = handler;
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

    // Supply this subcommand's follow-up handlers.
    ctx.msgFollowUpHandlers = this.msgFollowUpHandlers;

    return this.handler(ctx);
  }

  /**
   * Checks whether the command execution is permitted according to the specified
   * required permissions.
   *
   * @param ctx The execution context of the command.
   * @param displayName The display name of the command.
   * @param requiredPerms The Discord permissions required to execute the command.
   */
  static async checkPermissions(
    ctx: ExecutionContext,
    displayName: string,
    requiredPerms: Discord.Permission[],
  ): Promise<boolean> {
    const [missingPerm, ok] = checkCtxPermissions(ctx, requiredPerms);

    if (!ok) {
      await ctx.respondWithError(
        `The ${bold(displayName)} command requires the ` +
          `${bold(
            Discord.PermissionName[missingPerm as Discord.Permission],
          )} permission, but you don't have it.`,
      );
    }

    return ok;
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
