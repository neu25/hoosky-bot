import create from './create';
import del from './delete';
import join from './join';
import leave from './leave';
import listAll from './listAll';
import listJoined from './listJoined';
import roster from './roster';
import switchSection from './switchSection';
import classmates from './classmates';

export const subcommands = [
  create,
  del,
  join,
  leave,
  listAll,
  listJoined,
  roster,
  switchSection,
  classmates,
];

export default subcommands;
