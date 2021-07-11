import { MessageFollowUpHandler } from './FollowUpManager';
import { CommandHandler } from './SubCommand';
import ExecutionContext from './ExecutionContext';

export type InteractionOpts = {
  id: string;
  handler: CommandHandler;
  msgFollowUpHandlers?: Record<string, MessageFollowUpHandler>;
};

class Interaction {
  readonly id: string;
  readonly msgFollowUpHandlers: Record<string, MessageFollowUpHandler>;
  private readonly _handler: CommandHandler;

  constructor(opts: InteractionOpts) {
    this.id = opts.id;
    this._handler = opts.handler;
    this.msgFollowUpHandlers = opts.msgFollowUpHandlers ?? {};
  }

  async execute(ctx: ExecutionContext): Promise<unknown> {
    ctx.msgFollowUpHandlers = this.msgFollowUpHandlers;

    return this._handler(ctx);
  }
}

export default Interaction;
