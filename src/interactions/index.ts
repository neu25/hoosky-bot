import Interaction from '../Interaction';
import mail from './mail';
import courses from './courses';

const interactions: Interaction[] = [...mail, ...courses];

export default interactions;
