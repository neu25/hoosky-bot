import * as Discord from '../Discord';
import Command from '../Command';
import CommandOption from '../CommandOption';
import { bold, pluralize } from '../format';
import SubCommand from '../SubCommand';
import {
  ctxCanRunCommand,
  countCtxAccessibleSubCommands,
  convertCommandListToOptionsList,
  checkCtxPermissions,
} from './_utils';
import commandList from './commands';

const help = new Command({
  name: 'help',
  displayName: 'Help',
  description: "Displays usage information about HooskBot's available commands",
  options: [
    new CommandOption({
      name: 'command',
      description: 'Get information about a specific command',
      required: false,
      choices: convertCommandListToOptionsList(commandList),
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const chosenCommand = ctx.getArgument<string>('command')?.trim();

    if (chosenCommand) {
      const sections: { name: string; description: string }[] = [];

      let heading = '';

      // Find the command with the given name.
      const command =
        commandList.find(element => element.name === chosenCommand) ??
        commandList[0];

      const subCommands = Object.values(command.subCommands);
      if (subCommands.length > 0 && subCommands[0] instanceof SubCommand) {
        heading = '\n\nSubcommands:';
        for (const sub of subCommands) {
          // Make sure we only count subcommands.
          if (!(sub instanceof SubCommand)) continue;
          if (checkCtxPermissions(ctx, sub.requiredPerms)[1]) {
            sections.push({
              name: `/${command.name} ` + sub.name,
              description: sub.props.description,
            });
          }
        }
      } else if ((command.props.options ?? []).length > 0) {
        // If the command has no subcommands but it has parameters, then list
        // the parameters.
        heading = '\n\nCommand parameters:';
        for (const option of command.props.options ?? []) {
          let name = option.name;
          if (!option.props.required) {
            name += ' (optional)';
          }
          sections.push({
            name: name,
            description: option.props.description,
          });
        }
      }

      // Map section groups to Discord embed fields
      const fields: Discord.EmbedField[] = sections.map(sec => ({
        name: sec.name, // The section name
        value: sec.description, // The section description
      }));

      return ctx.respondSilentlyWithEmbed({
        type: Discord.EmbedType.RICH,
        title: `Usage information for ${bold('/' + command.name)}`,
        description: command.props.description + (heading && bold(heading)),
        fields,
      });
    }

    // No specific command was chosen, so output entire command list.
    const displayedCmds: {
      name: string;
      description: string;
      subCommands: string;
    }[] = [];

    // Sort the commands in alphabetical order of name. The spread operator makes
    // a shallow copy of the command list.
    const sortedCmdList = [...commandList].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    for (const cmd of sortedCmdList) {
      if (ctxCanRunCommand(ctx, cmd)) {
        let subCommands = '';
        const subCommandCount = countCtxAccessibleSubCommands(ctx, cmd);
        if (subCommandCount > 0) {
          subCommands = ` (${subCommandCount} ${pluralize(
            'subcommand',
            subCommandCount,
          )})`;
        }

        displayedCmds.push({
          name: cmd.name,
          description: cmd.props.description,
          subCommands: subCommands,
        });
      }
    }

    // Map commands to Discord embed fields
    const fields: Discord.EmbedField[] = displayedCmds.map(cmd => ({
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
  },
});

export default help;
