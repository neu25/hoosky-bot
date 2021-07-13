import { list } from './list';
import { messageAdd } from './messageAdd';
import { messageDelete } from './messageDelete';
import { messageList } from './messageList';
import { scheduleGet } from './scheduleGet';
import { scheduleSet } from './scheduleSet';
import { set } from './set';
import { setChannel } from './setChannel';
import { setRole } from './setRole';
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
  setChannel,
  setRole,
  show,
  unset,
];

export default subcommands;
