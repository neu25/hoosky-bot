import * as Discord from './Discord';
import CommandOption, { CommandOptionProps } from './CommandOption';
import ExecutionContext from './ExecutionContext';
import SubCommand from './SubCommand';

export type SubCommandGroupProps = Omit<
  CommandOptionProps,
  'type' | 'required'
>;

/**
 * `SubCommandGroup` represents a command group that is a child of a parent
 * `Command`. It does not have a handler but rather groups `SubCommand`s.
 *
 * It is placed within a the `options` property of a `Command` or another
 * `SubCommandGroup`. The siblings of `SubCommandGroup` in said property must
 * also be `SubCommandGroup`s.
 */
class SubCommandGroup extends CommandOption {
  readonly subCommands: Record<string, SubCommand | SubCommandGroup>;

  constructor(props: SubCommandGroupProps) {
    super({ ...props, type: Discord.CommandOptionType.SUB_COMMAND_GROUP });

    this.subCommands = {};

    if (props.options) {
      for (const opt of props.options) {
        // Organize all `SubCommand`s and `SubCommandGroup`s.
        if (opt instanceof SubCommandGroup) {
          const name = opt.name;

          // Ensure there isn't already a sub-command group with the same name.
          if (name in this.subCommands) {
            throw new Error(
              `Two or more sub-commands have the same name: ${name}`,
            );
          }

          // Place sub-commands into bins with the command name as the key.
          this.subCommands[name] = opt;
        }
      }
    }
  }

  /**
   * Executes the command with an execution context, which is provided by
   * the Discord client answering the command.
   *
   * @param ctx The execution context.
   */
  execute(ctx: ExecutionContext): unknown | Promise<unknown> {
    const cmd = ctx._getCurrentCommand();

    const subCommand = this.subCommands[cmd];
    if (subCommand) {
      // Mark the current command group as handled, and execute the sub-command.
      ctx._advanceCommand();
      subCommand.execute(ctx);
      return;
    }

    throw new Error(`No sub-command with name: ${cmd}`);
  }
}

export default SubCommandGroup;
