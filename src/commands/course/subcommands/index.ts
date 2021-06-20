import { create } from './_create';
import { del } from './_delete';
import { join } from './_join';
import { leave } from './_leave';
import { list } from './_list';
import { roster } from './_roster';

export const subcommands = [create, del, join, leave, list, roster];

export default subcommands;
