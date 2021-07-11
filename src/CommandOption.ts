import * as Discord from './Discord';
import CommandOptionChoice from './CommandOptionChoice';

export type CommandOptionProps = {
  name: string;
  description: string;
  type: Discord.CommandOptionType;
  required?: boolean;
  choices?: CommandOptionChoice[];
  options?: CommandOption[];
};

/**
 * CommandOption specifies that an argument can be accepted to customize the
 * behavior of a command execution.
 */
class CommandOption {
  readonly name: string;
  readonly props: CommandOptionProps;

  constructor(opts: CommandOptionProps) {
    this.name = opts.name;
    this.props = opts;
  }

  /**
   * Serializes the command option to a JSON representation understood by the
   * Discord API.
   */
  serialize(): any {
    return {
      ...this.props,
      choices: this.props.choices?.map(c => c.serialize()),
      options: this.props.options?.map(c => c.serialize()),
    };
  }
}

export default CommandOption;
