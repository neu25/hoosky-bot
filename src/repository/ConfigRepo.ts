import { Collection as MongoCollection } from 'mongodb';
import * as Discord from '../Discord';
import { Collection, Config, Database } from '../database';

/**
 * Global config data structures
 */

export type GlobalBotConfig = {
  status: Discord.StatusType;
  statusMessage: string;
};

export type GlobalMailConfig = {
  guildId: string;
  categoryId: string;
  blockedUserIds: string[];
};

/**
 * Guild-specific config data structures
 */

export type GuildConfig = {
  commandPrefixes: string[];
  loggingChannelId: string;
};

export type RolesConfig = {
  muted: string;
  birthday: string;
};

export type BirthdayMessage = {
  id: number;
  message: string;
};

export type BirthdaysConfig = {
  scheduledHour: number;
  scheduledMinute: number;
  channel: string;
  messages: BirthdayMessage[];
};

export type CountdownConfig = {
  scheduledHour: number;
  scheduledMinute: number;
};

export type AnyboardConfig = {
  channelId: string;
  minReactionCount: number;
  blacklistedChannelIds: string[];
};

export type PinsConfig = {
  permittedChannels: string[];
};

/**
 * Default config values
 */

export const globalBotConfig: GlobalBotConfig = {
  status: Discord.StatusType.Online,
  statusMessage: 'DM me to contact mods',
};

export const rolesConfig: RolesConfig = {
  muted: '',
  birthday: '',
};

export const guildConfig: GuildConfig = {
  commandPrefixes: ['-'],
  loggingChannelId: '',
};

export const globalMailConfig: GlobalMailConfig = {
  guildId: '',
  categoryId: '',
  blockedUserIds: [],
};

export const birthdaysConfig: BirthdaysConfig = {
  scheduledHour: 7,
  scheduledMinute: 0,
  channel: '',
  messages: [{ id: 1, message: 'Happy birthday, %!' }],
};

export const countdownConfig: CountdownConfig = {
  scheduledHour: 12,
  scheduledMinute: 0,
};

export const anyboardConfig: AnyboardConfig = {
  channelId: '',
  minReactionCount: 1,
  blacklistedChannelIds: [],
};

export const pinsConfig: PinsConfig = {
  permittedChannels: [],
};

class ConfigRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  /**
   * Inserts default configuration values into the `config` collection. If one
   * already exists, the insertion is skipped.
   */
  async initialize(guildIds: string[]): Promise<void> {
    await this.insertGlobalIfNotExists(Config.BOT, globalBotConfig);
    await this.insertGlobalIfNotExists(Config.MAIL, globalMailConfig);

    for (const gId of guildIds) {
      await this.insertIfNotExists(gId, Config.ROLES, rolesConfig);
      await this.insertIfNotExists(gId, Config.GUILD, guildConfig);
      await this.insertIfNotExists(gId, Config.BIRTHDAYS, birthdaysConfig);
      await this.insertIfNotExists(gId, Config.COUNTDOWNS, countdownConfig);
      await this.insertIfNotExists(gId, Config.ANYBOARD, anyboardConfig);
      await this.insertIfNotExists(gId, Config.PINS, pinsConfig);
    }
  }

  async get<T>(
    guildId: string,
    docId: string,
  ): Promise<Partial<T> | undefined> {
    const cfg = await this.collection(guildId).findOne({ _id: docId });
    return (cfg || {}).value;
  }

  async getGlobal<T>(docId: string): Promise<Partial<T> | undefined> {
    const cfg = await this.globalCollection().findOne({ _id: docId });
    return (cfg || {}).value;
  }

  /**
   * Updates a configuration document in the `config` collection, creating
   * one if it does not exist.
   *
   * @param guildId The ID of the guild.
   * @param docId The ID of the document.
   * @param value The value of the document.
   */
  async update(guildId: string, docId: string, value: unknown): Promise<void> {
    await this.collection(guildId).updateOne(
      { _id: docId },
      {
        $set: {
          _id: docId,
          value,
        },
      },
      { upsert: true },
    );
  }

  /**
   * Updates a configuration document in the `config` collection in the global
   * database, creating one if it does not exist.
   *
   * @param docId The ID of the document.
   * @param value The value of the document.
   */
  async updateGlobal(docId: string, value: unknown): Promise<void> {
    await this.globalCollection().updateOne(
      { _id: docId },
      {
        $set: {
          _id: docId,
          value,
        },
      },
      { upsert: true },
    );
  }

  /**
   * Inserts a configuration document into the `config` collection if one does
   * not already exist.
   *
   * @param guildId The ID of the guild.
   * @param docId The ID of the document.
   * @param value The value of the document.
   */
  async insertIfNotExists(
    guildId: string,
    docId: string,
    value: unknown,
  ): Promise<void> {
    await this.collection(guildId).updateOne(
      { _id: docId },
      {
        $setOnInsert: {
          _id: docId,
          value,
        },
      },
      { upsert: true },
    );
  }

  /**
   * Inserts a configuration document into the `config` collection if one does
   * not already exist.
   *
   * @param docId The ID of the document.
   * @param value The value of the document.
   */
  async insertGlobalIfNotExists(docId: string, value: unknown): Promise<void> {
    await this.globalCollection().updateOne(
      { _id: docId },
      {
        $setOnInsert: {
          _id: docId,
          value,
        },
      },
      { upsert: true },
    );
  }

  collection(guildId: string): MongoCollection {
    return this._db.getDb(guildId).collection(Collection.CONFIG);
  }

  globalCollection(): MongoCollection {
    return this._db.getGlobalDb().collection(Collection.CONFIG);
  }
}

export default ConfigRepo;
