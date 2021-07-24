import syncCommands from './syncCommands';
import normalizeDatabase from './normalizeDatabase';
import birthdayMessageScheduler from './birthdayMessageScheduler';
import birthdayRoleScheduler from './birthdayRoleScheduler';

const GUILD_CREATE = [
  syncCommands,
  normalizeDatabase,
  birthdayMessageScheduler,
  birthdayRoleScheduler,
];

export default GUILD_CREATE;
