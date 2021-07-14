import Command from '../../Command';
import subcommands from './subcommands';

const birthday = new Command({
  name: 'birthday',
  displayName: 'Birthday',
  description: 'Manage server birthdays',
  options: subcommands,
});

export default birthday;
