import { AxiosInstance } from 'axios';
import * as Discord from './Discord';
import { performRequest } from './utils';

export type InteractionApiOpts = {
  interaction: Discord.Interaction;
  http: AxiosInstance;
  appId: string;
};

class InteractionApi {
  readonly interaction: Discord.Interaction;
  readonly appId: string;
  private readonly _http: AxiosInstance;

  constructor(opts: InteractionApiOpts) {
    this.interaction = opts.interaction;
    this.appId = opts.appId;
    this._http = opts.http;
  }

  /**
   * Responds to the command execution with the provided InteractionResponse.
   * Usually, you don't need to access this low-level method. See if
   * `respondWithMessage` or `respondLater` achieve what you want.
   *
   * @param res The raw interaction response.
   */
  respond(res: Discord.InteractionResponse): Promise<void> {
    return performRequest(async () => {
      await this._http.post(
        `/interactions/${this.interaction.id}/${this.interaction.token}/callback`,
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
   * Responds to the command execution with an embed.
   *
   * This is a convenience method for calling `respondWithEmbeds` with a single
   * embed.
   *
   * @param embed The Discord embed.
   * @param ephemeral If true, only the user who executed the command can see the
   * response. The response also disappears after a period of time.
   */
  respondWithEmbed(embed: Discord.Embed, ephemeral?: boolean): Promise<void> {
    return this.respondWithEmbeds([embed], ephemeral);
  }

  /**
   * Responds to the command execution with an embed only visible to the message
   * executor.
   *
   * This is a convenience method for calling `respondWithEmbed` with `ephemeral`
   * set to true.
   *
   * @param embed The Discord embed.
   */
  respondSilentlyWithEmbed(embed: Discord.Embed): Promise<void> {
    return this.respondWithEmbed(embed, true);
  }

  /**
   * Responds to the command execution with one of more embeds.
   *
   * @param embeds An array of Discord embeds.
   * @param ephemeral If true, only the user who executed the command can see the
   * response. The response also disappears after a period of time.
   */
  respondWithEmbeds(
    embeds: Discord.Embed[],
    ephemeral?: boolean,
  ): Promise<void> {
    const data: Discord.InteractionCommandCallbackData = { embeds };
    if (ephemeral) {
      data.flags = 64;
    }

    return this.respond({
      type: Discord.InteractionCallbackType.ChannelMessageWithSource,
      data,
    });
  }

  /**
   * Responds to the command execution with an error message only visible to the
   * executor. The error message is prefixed with "Unable to run command: ".
   *
   * @param content The error message.
   */
  respondWithError(content: string): Promise<void> {
    return this.respondWithMessage(`Unable to run command: ${content}`, true);
  }

  /**
   * Responds to the command execution with a message only visible to the executor.
   * @param content The content of the message.
   */
  respondSilently(content: string): Promise<void> {
    return this.respondWithMessage(content, true);
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
  getResponse(): Promise<Discord.Message> {
    return performRequest(async () => {
      const res = await this._http.get(
        `/webhooks/${this.appId}/${this.interaction.token}/messages/@original`,
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
   * @param data The follow-up message data.
   */
  followUp(data: Discord.FollowUpMessage): Promise<Discord.Message> {
    return performRequest(async () => {
      const res = await this._http.post(
        `/webhooks/${this.appId}/${this.interaction.token}`,
        data,
      );
      return res.data;
    });
  }

  /**
   * Follows-up with the initial interaction response with the provided message.
   *
   * @param msg The follow-up text message.
   */
  followUpWithMessage(msg: string): Promise<Discord.Message> {
    return this.followUp({ content: msg });
  }

  /**
   * Follows-up with the initial interaction with the provided error message.
   *
   * @param msg The follow-up text message.
   */
  followUpWithError(msg: string): Promise<Discord.Message> {
    return this.followUpWithMessage(`Error: ${msg}`);
  }

  /**
   * Edits a follow-up message.
   *
   * @param messageId The message ID of the follow-up.
   * @param edit The message edits.
   */
  editFollowUp(
    messageId: string,
    edit: Discord.MessageEdit,
  ): Promise<Discord.Message> {
    return performRequest(async () => {
      const res = await this._http.patch(
        `/webhooks/${this.appId}/${this.interaction.token}/messages/${messageId}`,
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
  deleteFollowUp(messageId: string): Promise<void> {
    return performRequest(
      async () =>
        await this._http.delete(
          `/webhooks/${this.appId}/${this.interaction.token}/messages/${messageId}`,
        ),
    );
  }
}

export default InteractionApi;
