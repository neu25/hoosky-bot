import Command from '../../Command';

import { create } from './subcommands/_create';
import { join } from './subcommands/_join';
import { list } from './subcommands/_list';
import { roster } from './subcommands/_roster';
import { leave } from './subcommands/_leave';
import { del } from './subcommands/_delete';

const course = new Command({
  name: 'course',
  description: 'Manage server courses',
  options: [create, join, list, roster, leave, del],
});

export default course;
