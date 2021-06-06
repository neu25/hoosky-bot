import { GuildConfig } from './types';

/**
 * Collection names
 */
export enum Collection {
  CONFIG = 'config',
}

/**
 * Document IDs within the `config` collection
 */
export enum Config {
  GUILD = 'guild',
}

/**
 * Default value of the `guild` configuration
 */
export const guildConfig: GuildConfig = {
  commandPrefixes: ['-'],
};
