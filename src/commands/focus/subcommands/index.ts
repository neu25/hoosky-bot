import SubCommand from '../../../SubCommand';
import setup from './setup';
import hardMode from './hardMode';
import softMode from './softMode';

const subcommands: SubCommand[] = [setup, hardMode, softMode];

export default subcommands;
