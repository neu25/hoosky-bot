import syncCommands from './syncCommands';
import normalizeDatabase from './normalizeDatabase';
import birthdayMessageScheduler from './birthdayMessageScheduler';
import birthdayRoleScheduler from './birthdayRoleScheduler';
import scheduler from './scheduler';

const GUILD_CREATE = [
  syncCommands,
  normalizeDatabase,
  birthdayMessageScheduler,
  birthdayRoleScheduler,
  scheduler,
];

export default GUILD_CREATE;
