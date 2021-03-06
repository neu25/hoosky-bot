import list from './list';
import messageAdd from './messageAdd';
import messageDelete from './messageDelete';
import messageList from './messageList';
import set from './set';
import unset from './unset';
import setChannel from './setChannel';
import setRole from './setRole';
import setSchedule from './setSchedule';
import show from './show';
import showSchedule from './showSchedule';

const subcommands = [
  list,
  messageAdd,
  messageDelete,
  messageList,
  set,
  setChannel,
  setRole,
  setSchedule,
  show,
  showSchedule,
  unset,
];

export default subcommands;
