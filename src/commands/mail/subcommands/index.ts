import SubCommand from '../../../SubCommand';
import setup from './setup';
import block from './block';
import unblock from './unblock';

const subcommands: SubCommand[] = [setup, block, unblock];

export default subcommands;
