import * as Discord from './Discord';

export type OptionTypeMap = {
  [Discord.CommandOptionType.SUB_COMMAND]: undefined;
  [Discord.CommandOptionType.SUB_COMMAND_GROUP]: undefined;
  [Discord.CommandOptionType.STRING]: string;
  [Discord.CommandOptionType.INTEGER]: number;
  [Discord.CommandOptionType.BOOLEAN]: boolean;
  [Discord.CommandOptionType.USER]: string;
  [Discord.CommandOptionType.CHANNEL]: string;
  [Discord.CommandOptionType.ROLE]: string;
  [Discord.CommandOptionType.MENTIONABLE]: string;
};
export type OptionType = OptionTypeMap[keyof OptionTypeMap];
export type Arguments = Record<string, OptionType>;
export type CommandExecution = {
  command: string[];
  args: Arguments;
};

/**
 * Parses `CommandInteractionData` provided by Discord into the command
 * sequence and the user-supplied arguments.
 *
 * `parseCommand` works recursively: it descends `CommandInteractionData`,
 * updating arguments and the command sequence.
 *
 * The command sequence is an ordered array representing the full command,
 * which includes the root command and any sub-commands.
 *
 * Example:
 *  - Executed command: `/starboard create min_stars: 7 channel: #heartboard`
 *  - Resulting command sequence: `['starboard', 'create']`
 *  - Resulting arguments: `{ min_stars: 7, channel: [object Object] }`
 *
 * @param data The command interaction data.
 */
export const parseCommand = (
  data: Discord.CommandInteractionData,
): CommandExecution => {
  const command: string[] = [data.name];
  const args: Arguments = {};

  const loadFromOptions = (
    options?: Discord.CommandInteractionDataOption[],
  ): void => {
    if (!options) {
      // Options is undefined, so do nothing.
      return;
    }

    if (
      options.length === 1 &&
      (options[0].type === Discord.CommandOptionType.SUB_COMMAND ||
        options[0].type === Discord.CommandOptionType.SUB_COMMAND_GROUP)
    ) {
      // The option is a sub-command or a sub-command group.
      const opt = options[0];
      // Save the sub-command.
      command.push(opt.name);
      // Recursively parse the command's children.
      return loadFromOptions(opt.options);
    }

    // The option is an argument.
    for (const opt of options) {
      // Save the argument.
      args[opt.name] = opt.value;
      // Recursively parse the option's children.
      loadFromOptions(opt.options);
    }
  };

  // If the root command contains sub-commands or arguments, parse them.
  loadFromOptions(data.options);

  return {
    command,
    args,
  };
};
