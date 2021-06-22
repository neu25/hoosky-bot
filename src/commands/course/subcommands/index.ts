import { create } from './_create';
import { del } from './_delete';
import { join } from './_join';
import { leave } from './_leave';
import { listAll } from './_listAll';
import { listJoined } from './_listJoined';
import { roster } from './_roster';

export const subcommands = [create, del, join, leave, listAll, listJoined, roster];

export default subcommands;
