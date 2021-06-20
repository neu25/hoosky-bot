import Command from '../../Command';
import subcommands from './subcommands';

const course = new Command({
  name: 'course',
  description: 'Manage server courses',
  options: subcommands,
});

export default course;
