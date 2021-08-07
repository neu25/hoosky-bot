import Command from '../../Command';
import subcommands from './subcommands';

const countdown = new Command({
  name: 'countdown',
  displayName: 'Countdown',
  description: 'Manage server countdowns',
  options: subcommands,
});

export default countdown;
