import * as Discord from '../Discord';
import Command from '../Command';
import CommandOption from '../CommandOption';
import { bold, pluralize } from '../format';
import { countSubCommands, getCommandOptionChoices } from './_utils';
import commandsList from './commands';

const help = new Command({
  name: 'help',
  displayName: 'Help',
  description: "Displays usage information about HooskBot's available commands",
  options: [
    new CommandOption({
      name: 'command',
      description: 'Get information about a specific command',
      required: false,
      choices: getCommandOptionChoices(commandsList),
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const chosenCommand = ctx.getArgument<string>('command')?.trim() as string;

    if (chosenCommand) {
      const sections: { name: string; description: string }[] = [];

      let heading = '';
      // Find the command with the chosen name. find() will always return the correct command because options are fixed
      // so the secondary clause just ensures that cmd will always be defined (even though it isn't really needed)
      const cmd =
        commandsList.find(element => element.name == chosenCommand) ||
        commandsList[0];

      const command = cmd.serialize();
      if (command.options) {
        if (command.options[0].type == 1) {
          // subCommands are type 1
          heading = '\n\nSubcommands:';
          for (const subCommand of command.options) {
            sections.push({
              name: `/${command.name} ` + subCommand.name,
              description: subCommand.description,
            });
          }
        } else {
          // If options are not type 1, they are parameters (type 3)
          heading = '\n\nCommand parameters:';
          for (const option of command.options) {
            let optional = '';
            if (!option.required) {
              optional = ' (optional)';
            }
            sections.push({
              name: option.name + optional,
              description: option.description,
            });
          }
        }
      }

      // Map section groups to Discord embed fields
      const fields: Discord.EmbedField[] = sections.map(sec => ({
        name: sec.name, // The section name
        value: sec.description, // The section description
      }));

      await ctx.respondSilentlyWithEmbed({
        type: Discord.EmbedType.RICH,
        title: `Usage information for ${bold('/' + command.name)}`,
        description: command.description + (heading && bold(heading)),
        fields,
      });
      return;
    } else {
      const commands: {
        name: string;
        description: string;
        subCommands: string;
      }[] = [];

      // Sort the commands in alphabetical order of name.
      const sortedCmdList = [...commandsList].sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      for (const cmd of sortedCmdList) {
        const command = cmd.serialize();
        let subCommands = '';
        const subCommandCount = countSubCommands(command.options);

        if (subCommandCount > 0) {
          subCommands = ` (${subCommandCount} ${pluralize(
            'subcommand',
            subCommandCount,
          )})`;
        }

        commands.push({
          name: command.name,
          description: command.description,
          subCommands: subCommands,
        });
      }

      // Map commands to Discord embed fields
      const fields: Discord.EmbedField[] = commands.map(cmd => ({
        name: '/' + cmd.name, // The command name
        value: cmd.description + cmd.subCommands, // The command description
      }));

      return await ctx.respondSilentlyWithEmbed({
        type: Discord.EmbedType.RICH,
        title: 'Command List',
        description:
          'Run `/help [command]` to view more information about a specific command.',
        fields,
      });
    }
  },
});

export default help;
