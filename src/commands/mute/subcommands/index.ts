import SubCommand from '../../../SubCommand';
import setup from './setup';
import add from './add';
import remove from './remove';

const subcommands: SubCommand[] = [setup, add, remove];

export default subcommands;
