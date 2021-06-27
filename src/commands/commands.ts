import ping from './ping';
import poll from './poll';
import mute from './mute';
import course from './course';

const commandsList = {
  ping: ping,
  mute: mute,
  poll: poll,
  course: course,
};

export default commandsList;
