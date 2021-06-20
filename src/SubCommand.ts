import * as Discord from './Discord';
import SubCommandGroup, { SubCommandGroupProps } from './SubCommandGroup';
import ExecutionContext from './ExecutionContext';
import Permissions from './Permissions';
import { bold } from './format';

export type CommandHandler = (ctx: ExecutionContext) => void | Promise<void>;

export type SubCommandOptions = {
  handler: CommandHandler;
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
  private readonly _handler: CommandHandler;
  private readonly _requiredPerms: Discord.Permission[];

  constructor(opts: SubCommandOptions) {
    const { handler, requiredPermissions, displayName, ...base } = opts;
    super(base);
    this.displayName = displayName;
    this._handler = handler;
    this._requiredPerms = requiredPermissions ?? [];
  }

  /**
   * Executes the command with an execution context, which is provided by
   * the Discord client answering the command.
   *
   * @param ctx The execution context.
   */
  async execute(ctx: ExecutionContext): Promise<void> {
    const { interaction } = ctx;
    if (!interaction.member) {
      throw new Error('No member found in interaction');
    }

    const executorPerms = new Permissions(interaction.member.permissions);
    for (const p of this._requiredPerms) {
      if (!executorPerms.hasPermission(p)) {
        await ctx.respondWithError(
          `The ${bold(this.displayName)} command requires the ` +
            `${bold(
              Discord.PermissionName[p],
            )} permission, but you don't have it.`,
        );
        return;
      }
    }

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
