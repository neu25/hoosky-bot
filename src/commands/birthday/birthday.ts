import Command from '../../Command';
import { list, set, show, unset } from './subcommands';

const birthday = new Command({
  name: 'birthday',
  description: 'Manage server birthdays',
  options: [list, set, show, unset],
});

export default birthday;
