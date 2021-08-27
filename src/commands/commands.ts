import Command from '../Command';
import ping from './ping';
import poll from './poll';
import mute from './mute';
import course from './course';
import pfp from './pfp';
import bot from './bot';
import say from './say';
import birthday from './birthday';
import mail from './mail';
import countdown from './countdown';
import anyboard from './anyboard';
import autoclear from './autoclear';
import pin from './pin';

const commandList: Command[] = [
  ping,
  mute,
  poll,
  course,
  pfp,
  bot,
  say,
  birthday,
  mail,
  anyboard,
  countdown,
  autoclear,
  pin,
];

export default commandList;
