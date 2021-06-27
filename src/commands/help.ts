import * as Discord from '../Discord';
import Command from '../Command';
import CommandOption from '../CommandOption';
import { bold } from '../format';
import { countSubCommands, getCommandOptionChoices } from './_utils';
import commandsList from './commands';

const help = new Command({
  name: 'help',
  description: "Displays usage information for the bot's available commands",
  options: [
    new CommandOption({
      name: 'command',
      description:
        'Optional command name for specific information about that command',
      required: false,
      choices: getCommandOptionChoices(commandsList),
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const chosenCommand = ctx.getArgument<string>('command')?.trim() as string;
    if (chosenCommand) {
      const sections = [];
      let description = '';
      const command = (commandsList as any)[chosenCommand].serialize();
      if (command.options) {
        if (command.options[0].type == 1) {
          // subCommands are type 1
          description = `\n\nSubcommands for /${command.name}:`;
          for (const subCommand of command.options) {
            sections.push({
              name: `/${command.name} ` + subCommand.name,
              description: subCommand.description,
            });
          }
        } else {
          // If options are not type 1, they are parameters (type 3)
          description = `\n\nCommand parameters for /${command.name}:`;
          for (const option of command.options) {
            let optional = '';
            if (!option.required) {
              optional = ' (Optional)';
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
        title: `Usage information for /${command.name}`,
        description: bold(
          `/${command.name}: ${command.description}` + description,
        ),
        fields,
      });
      return;
        
    } else {
      const commands = [];
      for (const cmd of Object.values(commandsList)) {
        const command = cmd.serialize();
        let subCommands = '';
        const subCommandCount = countSubCommands(command.options);
        if (subCommandCount > 0) {
          subCommands = ` (${subCommandCount} subcommand${
            subCommandCount > 1 ? 's' : ''
          })`;
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
          'Use `/help [command]` to view more information about a specific command',
        fields,
      });
    }
  },
});

export default help;
