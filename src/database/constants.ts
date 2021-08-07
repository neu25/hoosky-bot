/**
 * Collection names
 */
export enum Collection {
  CONFIG = 'config',
  POLL = 'poll',
  COURSES = 'courses',
  BIRTHDAYS = 'birthdays',
  COUNTDOWNS = 'countdowns',
  COUNTDOWN_ANNOUNCEMENTS = 'countdownAnnouncements',
  JOBS = 'jobs',
  MAIL = 'mail',
  ANYBOARD_MESSAGES = 'anyboardMessages',
}

/**
 * Document IDs within the `config` collection
 */
export enum Config {
  BOT = 'bot',
  GUILD = 'guild',
  ROLES = 'roles',
  MAIL = 'mail',
  BIRTHDAYS = 'birthdays',
  COUNTDOWNS = 'countdowns',
  ANYBOARD = 'anyboard',
}
