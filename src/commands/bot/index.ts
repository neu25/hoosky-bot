import Command from '../../Command';
import subcommands from './subcommands';

const bot = new Command({
  name: 'bot',
  description: 'Manage HooskBot',
  options: subcommands,
});

export default bot;
