import Command from '../../Command';

import { create } from './subcommands/create';
import { close } from './subcommands/close';

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
  options: [create, close],
});

export default poll;
