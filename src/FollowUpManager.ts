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
  expires: number;
};

class FollowUpManager {
  private readonly _pendingFollowUps: Record<string, PendingFollowUp>;
  private readonly _api: Api;
  private readonly _repos: Repositories;

  constructor(api: Api, repos: Repositories) {
    this._pendingFollowUps = {};
    this._api = api;
    this._repos = repos;

    // Periodically prune follow-ups.
    setInterval(() => {
      for (const f of Object.values(this._pendingFollowUps)) {
        // Check if the pending follow-up has expired.
        if (Date.now() > f.expires) {
          this.removePendingFollowUp(f.userId);
          f.ectx
            .followUpWithError(
              'Timed out while waiting for response. Please execute the command again.',
            )
            .catch(e => console.log(e));
        }
      }
    }, 500);
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

  removePendingFollowUp(userId: string): void {
    console.log('[Client] Deactivated follow-up from user', userId);
    delete this._pendingFollowUps[userId];
  }
}

export default FollowUpManager;
