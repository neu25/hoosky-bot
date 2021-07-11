import Command from '../../Command';
import subcommands from './subcommands';

const mail = new Command({
  name: 'mail',
  displayName: 'Mail',
  description: 'Manage server mail',
  options: subcommands,
});

export default mail;
