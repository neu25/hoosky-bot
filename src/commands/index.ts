import commandsList from './commands';
import help from './help';

const commands = {'help': help}; // Add help command

Object.assign(commands, commandsList); // Add remaining commands

export default commands;
