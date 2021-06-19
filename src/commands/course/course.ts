import Command from '../../Command';

import { create } from './subcommands/_create';
import { join } from './subcommands/_join';
import { list } from './subcommands/_list';
import { roster } from './subcommands/_roster';
import { leave } from './subcommands/_leave';
import { remove } from './subcommands/_remove';

const course = new Command({
  name: 'course',
  description: 'Manage server courses',
  options: [
    create,
    join,
    list,
    roster,
    leave,
    remove
  ],
});

export default course;
