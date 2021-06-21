import Command from '../../Command';
import subcommands from './subcommands';

/**
 * Basic /poll command.
 * TODO:
 *  - Delete poll/reactions
 *  - Time based poll
 *  - Reaction-count to close poll
 */
const poll = new Command({
  name: 'poll',
  description: 'Manage polls',
  options: subcommands,
});

export default poll;
