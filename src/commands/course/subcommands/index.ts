import SubCommand from '../../../SubCommand';
import create from './create';
import del from './delete';
import join from './join';
import leave from './leave';
import listAll from './listAll';
import listJoined from './listJoined';
import roster from './roster';
import classmates from './classmates';
import bulkCreate from './bulkCreate';
import rename from './rename';

const subcommands: SubCommand[] = [
  create,
  del,
  join,
  leave,
  listAll,
  listJoined,
  roster,
  classmates,
  bulkCreate,
  rename,
];

export default subcommands;
