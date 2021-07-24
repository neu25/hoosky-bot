import * as Discord from './Discord';
import TriggerContext from './TriggerContext';
import Api from './Api';
import { Repositories } from './repository';
import ExecutionContext from './ExecutionContext';

export type MessageFollowUpHandler = (
  tctx: TriggerContext<Discord.Message>,
  ectx: ExecutionContext,
) => unknown | Promise<unknown>;

type MessageFollowUp = {
  userId: string;
  channelId: string;
  messageId: string;
  handler: MessageFollowUpHandler;
  ectx: ExecutionContext;
  expires: number;
};

class FollowUpManager {
  private readonly _msgFollowUps: Record<string, MessageFollowUp>;
  private readonly _api: Api;
  private readonly _repos: Repositories;
  private readonly _appId: string;

  constructor(api: Api, repos: Repositories, appId: string) {
    this._msgFollowUps = {};
    this._api = api;
    this._repos = repos;
    this._appId = appId;

    // Periodically prune follow-ups.
    setInterval(() => {
      for (const f of Object.values(this._msgFollowUps)) {
        // Check if the pending follow-up has expired.
        if (Date.now() > f.expires) {
          this.removeMsgFollowUp(f.channelId, f.userId);

          f.ectx.api
            .createErrorReply(
              f.channelId,
              f.messageId,
              'Timed out while waiting for response. Please execute the command again.',
            )
            .catch(e => console.log(e));
        }
      }
    }, 500);
  }

  async handleMessage(
    msg: Discord.Message,
    ctx: TriggerContext<Discord.Message>,
  ): Promise<unknown> {
    const followUp =
      this._msgFollowUps[
        FollowUpManager.generateFollowUpKey(msg.channel_id, msg.author.id)
      ];

    if (followUp) {
      console.log(
        '[Client] Handling follow-up for user',
        msg.author.id,
        'in channel',
        msg.channel_id,
      );
      this.removeMsgFollowUp(msg.channel_id, msg.author.id);
      return followUp.handler(ctx, followUp.ectx);
    }
  }

  addMsgFollowUp(followUp: MessageFollowUp): void {
    console.log(
      '[Client] Waiting for message follow-up from user',
      followUp.userId,
      'in channel',
      followUp.channelId,
    );

    this._msgFollowUps[
      FollowUpManager.generateFollowUpKey(followUp.channelId, followUp.userId)
    ] = followUp;
  }

  removeMsgFollowUp(channelId: string, userId: string): void {
    console.log(
      '[Client] Deactivating message follow-up from user',
      userId,
      'in channel',
      channelId,
    );

    delete this._msgFollowUps[
      FollowUpManager.generateFollowUpKey(channelId, userId)
    ];
  }

  static generateFollowUpKey(channelId: string, userId: string): string {
    return `${channelId}-${userId}`;
  }
}

export default FollowUpManager;
