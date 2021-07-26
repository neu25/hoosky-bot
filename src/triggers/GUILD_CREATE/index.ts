import syncCommands from './syncCommands';
import normalizeDatabase from './normalizeDatabase';
import startScheduler from './startScheduler';

const GUILD_CREATE = [syncCommands, normalizeDatabase, startScheduler];

export default GUILD_CREATE;
