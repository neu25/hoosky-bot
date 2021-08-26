import Command from '../../Command';
import subcommands from './subcommands';

const pin = new Command({
  name: 'pin',
  displayName: 'Pin',
  description: 'Manage pins',
  options: subcommands,
});

export default pin;
