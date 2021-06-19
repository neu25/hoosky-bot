import Command from '../../Command';

import { create } from './_create';
import { join } from './_join';
import { list } from './_list';
import { roster } from './_roster';

const course = new Command({
  name: 'course',
  description: 'Manage server courses',
  options: [
    create,
    join,
    list,
    roster,
  ],
});

export default course;
