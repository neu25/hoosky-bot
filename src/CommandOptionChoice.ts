export type CommandOptionChoiceProps = {
  name: string;
  value: string | number;
};

/**
 * CommandOptionChoice can be used to feed different values to a single command's option.
 * NOTE: Accepts only integer and string values
 */
class CommandOptionChoice {
  private readonly _opts: CommandOptionChoiceProps;

  constructor(opts: CommandOptionChoiceProps) {
    this._opts = opts;
  }

  /**
   * Returns the name of the choice.
   */
  getName(): string {
    return this._opts.name;
  }

  /**
   * Serializes the choice to a JSON representation understood by the
   * Discord API.
   */
  serialize(): any {
    return this._opts;
  }
}

export default CommandOptionChoice;
