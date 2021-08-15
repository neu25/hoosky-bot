import SubCommand from '../../../SubCommand';
import enable from './enable';
import disable from './disable';
import viewConfiguration from './viewConfiguration';

const subcommands: SubCommand[] = [enable, disable, viewConfiguration];

export default subcommands;
