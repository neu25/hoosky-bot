/**
 * `Snowflake` represents a Discord snowflake ID, which is a special ID that
 * includes a timestamp.
 *
 * This constructor creates a Discord snowflake object representation containing
 * methods for extracting data, such as the timestamp, out of the ID.
 *
 * For more information on snowflake IDs, see
 * https://discord.com/developers/docs/reference#snowflakes.
 */
class Snowflake {
  private readonly _timestamp: Date;

  constructor(id: string) {
    // Convert the string ID into a Big Integer (64 bits).
    const snowflake = BigInt(id);
    // Extract the timestamp out of the snowflake.
    const timestamp = BigInt(snowflake >> BigInt(22)) + BigInt(1420070400000);
    // Save the timestamp.
    this._timestamp = new Date(Number(timestamp));
  }

  /**
   * Returns the Date of the snowflake ID.
   */
  getDate(): Date {
    return this._timestamp;
  }
}

export default Snowflake;
