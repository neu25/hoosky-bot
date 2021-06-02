import * as Discord from './Discord';

export type CommandOptionProps = {
  name: string;
  description: string;
  type: Discord.CommandOptionType;
  options?: CommandOption[];
};

/**
 * CommandOption specifies that an argument can be accepted to customize the
 * behavior of a command execution.
 */
class CommandOption {
  private readonly _opts: CommandOptionProps;

  constructor(opts: CommandOptionProps) {
    this._opts = opts;
  }

  /**
   * Returns the name of the command option.
   */
  getName(): string {
    return this._opts.name;
  }

  /**
   * Serializes the command option to a JSON representation understood by the
   * Discord API.
   */
  serialize(): any {
    return {
      ...this._opts,
      options: this._opts.options?.map(c => c.serialize()),
    };
  }
}

export default CommandOption;
