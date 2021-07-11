import { list } from './list';
import { messageAdd } from './messageAdd';
import { messageDelete } from './messageDelete';
import { messageList } from './messageList';
import { scheduleGet } from './scheduleGet';
import { scheduleSet } from './scheduleSet';
import { set } from './set';
import { setup } from './setup';
import { show } from './show';
import { unset } from './unset';

const subcommands = [
  list,
  messageAdd,
  messageDelete,
  messageList,
  scheduleGet,
  scheduleSet,
  set,
  setup,
  show,
  unset,
];

export default subcommands;
