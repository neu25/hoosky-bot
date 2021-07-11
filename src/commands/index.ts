import commandList from './commands';
import help from './help';

const commands = [help, ...commandList]; // Add help command.

export default commands;
