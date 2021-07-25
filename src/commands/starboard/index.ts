import Command from '../../Command';
import subcommands from './subcommands';

const starboard = new Command({
  name: 'starboard',
  displayName: 'Starboard',
  description: 'Execute starboard commands',
  options: subcommands,
});

export default starboard;
