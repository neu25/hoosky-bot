import * as Discord from '../../Discord';
import Command from '../../Command';
import subcommands from './subcommands';

export const MUTED_PERMISSIONS = {
  allow: '0',
  deny: String(Discord.Permission.SEND_MESSAGES),
};

const mute = new Command({
  name: 'mute',
  displayName: 'Mute',
  description: 'Execute mute commands',
  options: subcommands,
});

export default mute;
