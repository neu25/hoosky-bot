import * as Discord from './Discord';
import Api from './Api';

// The maximum number of deduplication keys to store.
const MAX_DEDUPE_STACK_SIZE = 10_000;

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
  private _channelId?: string;
  private _dedupeKeys: string[];
  private readonly _api: Api;

  constructor(api: Api) {
    this._api = api;
    this._dedupeKeys = [];
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
   * @param key
   */
  preventDupe(key: string): void {
    if (this._dedupeKeys.includes(key)) return;

    this._dedupeKeys.push(key);

    // Prevent the number of dedupe keys from getting too big.
    while (this._dedupeKeys.length > MAX_DEDUPE_STACK_SIZE) {
      this._dedupeKeys.shift();
    }
  }

  /**
   * Removes the specified deduplication key.
   *
   * @param key
   */
  removeDedupeKey(key: string): void {
    const index = this._dedupeKeys.indexOf(key);
    if (index === -1) return;
    this._dedupeKeys = this._dedupeKeys.splice(index, 1);
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
   * @param embed The embed to send in the channel.
   * @param dedupeKey A key constructed from relevant data to prevent redundant
   * logging of certain actions.
   */
  async logMessage(embed: Discord.Embed, dedupeKey?: string): Promise<void> {
    if (!this._channelId) return;

    // If the key is included in `_dedupeKeys`, then remove that key, and skip
    // the log.
    if (dedupeKey && this._dedupeKeys.includes(dedupeKey)) {
      return this.removeDedupeKey(dedupeKey);
    }

    await this._api.createMessage(this._channelId, {
      embeds: [
        {
          color: Discord.Color.PRIMARY,
          timestamp: new Date().toISOString(),
          ...embed,
        },
      ],
    });
  }

  /**
   * Sets the channel in which logs should be pushed to.
   *
   * @param id The ID of the channel.
   */
  setChannel(id: string): void {
    this._channelId = id;
  }
}

export default AuditLogger;
