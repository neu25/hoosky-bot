import syncCommands from './syncCommands';
import normalizeDatabase from './normalizeDatabase';
import birthdayScheduler from './birthdayScheduler';

const GUILD_CREATE = [syncCommands, normalizeDatabase, birthdayScheduler];

export default GUILD_CREATE;
