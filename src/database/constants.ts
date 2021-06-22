import { GuildConfig, RolesConfig, BirthdaysConfig } from './types';

/**
 * Collection names
 */
export enum Collection {
  CONFIG = 'config',
  COURSES = 'courses',
  BIRTHDAYS = 'birthdays',
}

/**
 * Document IDs within the `config` collection
 */
export enum Config {
  GUILD = 'guild',
  ROLES = 'roles',
  BIRTHDAYS = 'birthdays',
}

export const rolesConfig: RolesConfig = {
  muted: '',
};

/**
 * Default value of the `guild` configuration
 */
export const guildConfig: GuildConfig = {
  commandPrefixes: ['-'],
};

export const birthdaysConfig: BirthdaysConfig = {
  schedule: '00 15 10 * * *',
  channel: '',
  messages: ['Happy birthday, @!'],
};
