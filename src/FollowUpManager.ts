import * as Discord from './Discord';
import { FollowUpHandler } from './SubCommand';
import TriggerContext from './TriggerContext';
import Api from './Api';
import { Repositories } from './repository';
import ExecutionContext from './ExecutionContext';

type PendingFollowUp = {
  userId: string;
  handler: FollowUpHandler;
  ectx: ExecutionContext;
};

class FollowUpManager {
  private readonly _pendingFollowUps: Record<string, PendingFollowUp>;
  private readonly _api: Api;
  private readonly _repos: Repositories;

  constructor(api: Api, repos: Repositories) {
    this._pendingFollowUps = {};
    this._api = api;
    this._repos = repos;
  }

  handleMessage(msg: Discord.Message): void {
    const followUp = this._pendingFollowUps[msg.author.id];
    if (followUp) {
      console.log('[Client] Handling follow-up for user', msg.author.id);
      followUp.handler(
        new TriggerContext<Discord.Message>(this._api, this._repos, msg),
        followUp.ectx,
      );
    }
  }

  addPendingFollowUp(followUp: PendingFollowUp): void {
    console.log('[Client] Waiting for follow-up from user', followUp.userId);
    this._pendingFollowUps[followUp.userId] = followUp;
  }
}

export default FollowUpManager;
