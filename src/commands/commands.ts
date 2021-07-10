import Command from '../Command';
import ping from './ping';
import poll from './poll';
import mute from './mute';
import course from './course';
import pfp from './pfp';
import bot from './bot';
import say from './say';

const commandList: Command[] = [ping, mute, poll, course, pfp, bot, say];

export default commandList;
