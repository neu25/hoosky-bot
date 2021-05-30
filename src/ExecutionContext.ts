import axios from 'axios';
import * as Discord from './Discord';
import Snowflake from './Snowflake';
import { performRequest } from './utils';

const client = axios.create({
  baseURL: 'https://discord.com/api/v8',
});

/**
 * ExecutionContext is a helper class with a straightforward interface for
 * handling commands.
 *
 * With ExecutionContext, you can respond to a command execution in several
 * ways, such as replying to the message.
 *
 * It is passed as an argument to the command handler function, and it provides
 * all the necessary information about the executed command.
 *
 * For more information about possible responses to an Interaction, see
 * https://discord.com/developers/docs/interactions/slash-commands#responding-to-an-interaction.
 */
class ExecutionContext {
  private readonly _appId: string;
  private readonly _interaction: Discord.Interaction;

  constructor(appId: string, interaction: Discord.Interaction) {
    this._appId = appId;
    this._interaction = interaction;
  }

  /**
   * Returns the raw interaction object provided by Discord. Usually, you don't
   * need to access this object. See if there is another method that achieves
   * the abstract action you want.
   */
  getInteraction(): Discord.Interaction {
    return this._interaction;
  }

  /**
   * Returns the date of the command execution.
   */
  getInteractionDate(): Date {
    return new Snowflake(this._interaction.id).getDate();
  }

  /**
   * Responds to the command execution with the provided InteractionResponse.
   * Usually, you don't need to access this low-level method. See if
   * `respondWithMessage` or `respondLater` achieve what you want.
   *
   * @param res The raw interaction response.
   */
  async respond(res: Discord.InteractionResponse): Promise<void> {
    return performRequest(async () => {
      await client.post(
        `/interactions/${this._interaction.id}/${this._interaction.token}/callback`,
        res,
      );
    });
  }

  /**
   * Responds to the command execution with the provided message.
   *
   * @param content The content of the message.
   * @param ephemeral If true, only the user who executed the command can see the
   * response. The response also disappears after a period of time.
   */
  respondWithMessage(content: string, ephemeral?: boolean): Promise<void> {
    const data: Discord.InteractionCommandCallbackData = { content };
    if (ephemeral) {
      data.flags = 64;
    }

    return this.respond({
      type: Discord.InteractionCallbackType.ChannelMessageWithSource,
      data,
    });
  }

  /**
   * Responds to the command execution with a loading status. `editResponse`
   * should be called later to update the initial response message.
   */
  respondLater(): Promise<void> {
    return this.respond({
      type: Discord.InteractionCallbackType.DeferredChannelMessageWithSource,
    });
  }

  /**
   * Returns our response to the command execution. This is only relevant if
   * `respond` has already been called.
   */
  async getResponse(): Promise<Discord.Message> {
    return performRequest(async () => {
      const res = await client.get(
        `/webhooks/${this._appId}/${this._interaction.token}/messages/@original`,
      );
      return res.data;
    });
  }

  /**
   * Edits our original response to the command execution.
   *
   * @param edit The message edit.
   */
  editResponse(edit: Discord.MessageEdit): Promise<Discord.Message> {
    return this.editFollowUp('@original', edit);
  }

  /**
   * Deletes our original response to the command execution.
   */
  deleteResponse(): Promise<void> {
    return this.deleteFollowUp('@original');
  }

  /**
   * Sends a follow-up message on top of the initial interaction response.
   *
   * @param msg The follow-up message.
   */
  async followUp(msg: Discord.FollowUpMessage): Promise<Discord.Message> {
    return performRequest(async () => {
      const res = await client.post(
        `/webhooks/${this._appId}/${this._interaction.token}`,
        msg,
      );
      return res.data;
    });
  }

  /**
   * Edits a follow-up message.
   *
   * @param messageId The message ID of the follow-up.
   * @param edit The message edits.
   */
  async editFollowUp(
    messageId: string,
    edit: Discord.MessageEdit,
  ): Promise<Discord.Message> {
    return performRequest(async () => {
      const res = await client.patch(
        `/webhooks/${this._appId}/${this._interaction.token}/messages/${messageId}`,
        edit,
      );
      return res.data;
    });
  }

  /**
   * Deletes a follow-up message.
   *
   * @param messageId The message ID of the follow-up.
   */
  async deleteFollowUp(messageId: string): Promise<void> {
    await performRequest(() =>
      client.delete(
        `/webhooks/${this._appId}/${this._interaction.token}/messages/${messageId}`,
      ),
    );
  }
}

export default ExecutionContext;
