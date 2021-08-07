import SubCommand from '../../../SubCommand';
import configure from './configure';
import viewConfiguration from './viewConfiguration';
import blacklistChannel from './blacklistChannel';
import unblacklistChannel from './unblacklistChannel';

const subcommands: SubCommand[] = [
  configure,
  viewConfiguration,
  blacklistChannel,
  unblacklistChannel,
];

export default subcommands;
