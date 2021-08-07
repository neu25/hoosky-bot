import * as Discord from './Discord';
import Api from './Api';

// The maximum number of deduplication keys to store.
const MAX_DEDUPE_STACK_SIZE = 10_000;

const GLOBAL_ID = 'global';

/**
 * For more information on deduplication of log messages, see the explanation in
 * `AuditLogger.logMessage`.
 */
export type DupeKeyProps = {
  guildId?: string; // The guild in which the action was performed.
  action?: string; // The action itself (lowercase, underscores).
  subjectId?: string; // The ID of the subject who performed the action.
  objectId?: string; // The ID of the object being acted on.
};

class AuditLogger {
  private readonly _dedupeKeys: Record<string, string[]>;
  private readonly _channelIds: Record<string, string>;
  private readonly _api: Api;

  constructor(api: Api) {
    this._api = api;
    this._dedupeKeys = {};
    this._channelIds = {};
  }

  /**
   * Generates a deduplication key based on optional properties.
   *
   * @param props Deduplication properties (all optional).
   */
  static generateDupeKey(props: DupeKeyProps): string {
    return [props.guildId, props.action, props.subjectId, props.objectId]
      .map(p => p ?? '')
      .join('-');
  }

  /**
   * Adds a deduplication key.
   *
   * @param guildId The ID of the guild.
   * @param key
   */
  preventDupe(guildId: string, key: string): void {
    const dedupeKeys = (this._dedupeKeys[guildId] =
      this._dedupeKeys[guildId] ?? []);

    if (dedupeKeys.includes(key)) return;

    dedupeKeys.push(key);

    // Prevent the number of dedupe keys from getting too big.
    while (dedupeKeys.length > MAX_DEDUPE_STACK_SIZE) {
      dedupeKeys.shift();
    }
  }

  /**
   * Removes the specified deduplication key.
   *
   * @param guildId The ID of the guild.
   * @param key
   */
  removeDedupeKey(guildId: string, key: string): void {
    const dedupeKeys = (this._dedupeKeys[guildId] =
      this._dedupeKeys[guildId] ?? []);

    const index = dedupeKeys.indexOf(key);
    if (index === -1) return;
    this._dedupeKeys[guildId] = dedupeKeys.splice(index, 1);
  }

  /**
   * Pushes a message (formatted as a Discord embed) into the log channel.
   *
   * Deduplication (dedupeKey) example: If a course role is MANUALLY removed from
   * a user, the bot should let moderators know that it acted on the trigger and
   * made the corresponding database removal.
   * HOWEVER, if the role was removed due to `/course leave`, it is redundant to
   * let moderators know, because there was no IMPLICIT action.
   *
   * @param guildId The guild the channel is located.
   * @param embed The embed to send in the channel.
   * @param dedupeKey A key constructed from relevant data to prevent redundant
   * logging of certain actions.
   */
  async logMessage(
    guildId: string,
    embed: Discord.Embed,
    dedupeKey?: string,
  ): Promise<void> {
    const channelId = this._channelIds[guildId];
    if (!channelId) return;

    // If the key is included in `_dedupeKeys`, then remove that key, and skip
    // the log.
    if (dedupeKey && this._dedupeKeys[guildId]?.includes(dedupeKey)) {
      return this.removeDedupeKey(guildId, dedupeKey);
    }

    await this._api.createMessage(channelId, {
      embeds: [
        {
          color: Discord.Color.PRIMARY,
          timestamp: new Date().toISOString(),
          ...embed,
        },
      ],
    });
  }

  async logGlobalMessage(
    embed: Discord.Embed,
    dedupeKey?: string,
  ): Promise<void> {
    // If the key is included in `_dedupeKeys`, then remove that key, and skip
    // the log.
    if (dedupeKey && this._dedupeKeys[GLOBAL_ID]?.includes(dedupeKey)) {
      return this.removeDedupeKey(GLOBAL_ID, dedupeKey);
    }

    // Log the message in every audit logging channel.
    for (const channelId of Object.values(this._channelIds)) {
      await this._api.createMessage(channelId, {
        embeds: [
          {
            color: Discord.Color.PRIMARY,
            timestamp: new Date().toISOString(),
            ...embed,
          },
        ],
      });
    }
  }

  /**
   * Sets the channel in which logs should be pushed to for a guild.
   *
   * @param guildId The ID of the guild.
   * @param channelId The ID of the channel.
   */
  setChannel(guildId: string, channelId: string): void {
    this._channelIds[guildId] = channelId;
  }
}

export default AuditLogger;
