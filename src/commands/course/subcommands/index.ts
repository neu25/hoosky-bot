import create from './create';
import del from './delete';
import join from './join';
import leave from './leave';
import listAll from './listAll';
import listJoined from './listJoined';
import roster from './roster';

const subcommands = [create, del, join, leave, listAll, listJoined, roster];

export default subcommands;
