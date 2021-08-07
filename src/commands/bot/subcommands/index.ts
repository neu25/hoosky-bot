import SubCommand from '../../../SubCommand';
import setStatus from './setStatus';
import viewJobs from './viewJobs';
import setLoggingChannel from './setLoggingChannel';

const subcommands: SubCommand[] = [setStatus, viewJobs, setLoggingChannel];

export default subcommands;
