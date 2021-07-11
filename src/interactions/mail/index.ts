import Interaction from '../../Interaction';
import reply from './reply';
import deleteThread from './deleteThread';
import blockUser from './blockUser';

const mail: Interaction[] = [reply, deleteThread, blockUser];

export default mail;
