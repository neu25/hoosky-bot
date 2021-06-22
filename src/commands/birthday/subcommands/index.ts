import { list } from './_list';
import { messageAdd } from './_messageAdd';
import { messageDelete } from './_messageDelete';
import { messageList } from './_messageList';
import { set } from './_set';
import { show } from './_show';
import { unset } from './_unset';

export const subcommands = [
  list,
  messageAdd,
  messageDelete,
  messageList,
  set,
  show,
  unset,
];

export default subcommands;
