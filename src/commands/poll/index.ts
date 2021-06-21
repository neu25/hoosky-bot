import Command from '../../Command';
import subcommands from './subcommands';

/**
 * Basic /poll command.
 * TODO:
 *  - Time based poll
 *  - Reaction-count to close poll
 *  - List polls
 *  - Admin controls
 */
const poll = new Command({
  name: 'poll',
  description: 'Manage polls',
  options: subcommands,
});

export default poll;
