import SubCommand from '../../../SubCommand';
import setStatus from './setStatus';
import viewJobs from './viewJobs';

const subcommands: SubCommand[] = [setStatus, viewJobs];

export default subcommands;
