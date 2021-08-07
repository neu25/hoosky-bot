import Command from '../../Command';
import subcommands from './subcommands';

const anyboard = new Command({
  name: 'anyboard',
  displayName: 'Anyboard',
  description: 'Execute anyboard commands',
  options: subcommands,
});

export default anyboard;
