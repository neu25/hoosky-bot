import * as Discord from './Discord';
import Interaction from './Interaction';
import ExecutionContext from './ExecutionContext';

class InteractionManager {
  private readonly _interactions: Record<string, Interaction>;

  constructor() {
    this._interactions = {};
  }

  setInteractions(interactions: Interaction[]): void {
    for (const int of interactions) {
      this._interactions[int.id] = int;
    }
  }

  async handleInteraction(
    interaction: Discord.Interaction,
    ctx: ExecutionContext,
  ): Promise<unknown> {
    if (
      !interaction.data ||
      interaction.type !== Discord.InteractionType.MessageComponent
    ) {
      return;
    }

    const { data } = interaction;
    console.log('[Interaction Manager] Handling interaction', data.custom_id);

    const int = this._interactions[data.custom_id];
    if (int) {
      return int.execute(ctx);
    }
  }
}

export default InteractionManager;
