import Command from '../../Command';
import subcommands from './subcommands';

const birthday = new Command({
  name: 'birthday',
  description: 'Manage server birthdays',
  options: subcommands,
});

export default birthday;
