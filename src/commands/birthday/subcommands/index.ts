import { list } from './_list';
import { messageAdd } from './_messageAdd';
import { messageDelete } from './_messageDelete';
import { messageList } from './_messageList';
import { schedule } from './_schedule';
import { set } from './_set';
import { setup } from './_setup';
import { show } from './_show';
import { unset } from './_unset';

export const subcommands = [
  list,
  messageAdd,
  messageDelete,
  messageList,
  schedule,
  set,
  setup,
  show,
  unset,
];

export default subcommands;
