import * as Discord from '../../Discord';
import Command from '../../Command';
import subcommands from './subcommands';

export const FOCUS_HARD_PERMISSIONS = {
  allow: '0',
  deny: String(Discord.Permission.VIEW_CHANNEL),
};

export const FOCUS_SOFT_PERMISSIONS = {
  allow: '0',
  deny: String(Discord.Permission.SEND_MESSAGES),
};

const focus = new Command({
  name: 'focus',
  displayName: 'Focus',
  description: 'Focus mode commands',
  options: subcommands,
});

export default focus;
