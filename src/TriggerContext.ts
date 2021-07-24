import BaseContext, { BaseContextOpts } from './BaseContext';

export type TriggerContextOpts<T> = {
  data: T;
} & BaseContextOpts;

class TriggerContext<T> extends BaseContext {
  readonly data: T;

  constructor(opts: TriggerContextOpts<T>) {
    super(opts);
    this.data = opts.data;
  }
}

export default TriggerContext;
