import Command from '../../Command';
import subcommands from './subcommands';

const autoclear = new Command({
  name: 'autoclear',
  displayName: 'Autoclear',
  description: 'Execute autoclear commands',
  options: subcommands,
});

export default autoclear;
