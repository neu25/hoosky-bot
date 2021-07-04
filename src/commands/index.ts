import commandsList from './commands';
import help from './help';

const commands = [help]; // Add help command

for (const command of commandsList) {
  // Add remaining commands
  commands.push(command);
}

export default commands;
