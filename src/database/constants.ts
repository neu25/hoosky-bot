import { GuildConfig } from './types';

/**
 * Collection names
 */
export enum Collection {
  CONFIG = 'config',
  POLL = 'poll',
  COURSES = 'courses',
}

/**
 * Document IDs within the `config` collection
 */
export enum Config {
  GUILD = 'guild',
  ROLES = 'roles',
}

/**
 * Default value of the `guild` configuration
 */
export const guildConfig: GuildConfig = {
  commandPrefixes: ['-'],
};
