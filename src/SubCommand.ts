import * as Discord from './Discord';
import SubCommandGroup, { SubCommandGroupProps } from './SubCommandGroup';
import ExecutionContext from './ExecutionContext';
import TriggerContext from './TriggerContext';
import { hasPermission } from './permissions';
import { bold } from './format';

export type CommandHandler = (
  ctx: ExecutionContext,
) => unknown | Promise<unknown>;
export type FollowUpHandler = (
  tctx: TriggerContext<Discord.Message>,
  ectx: ExecutionContext,
) => unknown | Promise<unknown>;

export type SubCommandOptions = {
  handler: CommandHandler;
  followUpHandlers?: Record<string, FollowUpHandler>;
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
  readonly followUpHandlers: Record<string, FollowUpHandler>;
  private readonly _handler: CommandHandler;
  private readonly _requiredPerms: Discord.Permission[];

  constructor(opts: SubCommandOptions) {
    const {
      handler,
      requiredPermissions,
      displayName,
      followUpHandlers,
      ...base
    } = opts;
    super(base);
    this.displayName = displayName;
    this.followUpHandlers = followUpHandlers ?? {};
    this._handler = handler;
    this._requiredPerms = requiredPermissions ?? [];
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
        this._requiredPerms,
      ))
    ) {
      return;
    }

    // Supply this subcommand's follow-up handlers.
    ctx._setFollowUpHandlers(this.followUpHandlers);

    return this._handler(ctx);
  }

  /**
   * Checks whether the command execution is permitted according to the specified
   * required permissions.
   *
   * @param ctx The ExecutionContext of the command.
   * @param displayName The display name of the command.
   * @param requiredPerms The Discord permissions required to execute the command.
   */
  static async checkPermissions(
    ctx: ExecutionContext,
    displayName: string,
    requiredPerms: Discord.Permission[],
  ): Promise<boolean> {
    const { interaction } = ctx;
    if (!interaction.member) {
      throw new Error('No member found in interaction');
    }

    const executorPerms = parseInt(interaction.member.permissions ?? '0');
    for (const p of requiredPerms) {
      if (!hasPermission(executorPerms, p)) {
        await ctx.respondWithError(
          `The ${bold(displayName)} command requires the ` +
            `${bold(
              Discord.PermissionName[p],
            )} permission, but you don't have it.`,
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Serializes the command option to a JSON representation understood by the
   * Discord API.
   */
  serialize(): any {
    return {
      requiredPerms: this._requiredPerms,
      ...super.serialize(),
      type: Discord.CommandOptionType.SUB_COMMAND,
    };
  }
}

export default SubCommand;
