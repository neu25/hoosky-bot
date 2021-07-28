import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import CommandOptionChoice from '../../../CommandOptionChoice';
import { bold } from '../../../format';
import { Config } from '../../../database';
import { BotConfig } from '../../../repository/ConfigRepo';

export const STATUSES: Record<Discord.StatusType, string> = {
  [Discord.StatusType.Online]: 'Online',
  [Discord.StatusType.Idle]: 'Idle',
  [Discord.StatusType.Dnd]: 'Do Not Disturb',
  [Discord.StatusType.Invisible]: 'Invisible',
  [Discord.StatusType.Offline]: 'Offline',
};

const setStatus = new SubCommand({
  name: 'set-status',
  displayName: 'Set Status',
  description: 'Set the activity status of the bot',
  requiredPermissions: [Discord.Permission.ADMINISTRATOR],
  options: [
    new CommandOption({
      name: 'status',
      description: 'The online status of the bot',
      type: Discord.CommandOptionType.STRING,
      required: true,
      choices: Object.keys(STATUSES).map(
        statusType =>
          new CommandOptionChoice({
            name: STATUSES[statusType as Discord.StatusType],
            value: statusType,
          }),
      ),
    }),
    new CommandOption({
      name: 'message',
      description: 'Show a “Playing [message]” status message',
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const status = ctx.getArgument<string>('status') as Discord.StatusType;
    const message = ctx.getArgument<string>('message');

    // Send a status update message to the gateway.
    ctx.client.updateStatus(status, message);

    const currentBotCfg =
      (await ctx.config().getGlobal<BotConfig>(Config.BOT)) ?? {};

    // Update the saved status.
    const botCfg: Partial<BotConfig> = {
      ...currentBotCfg,
      status,
      statusMessage: message ?? '',
    };
    await ctx.config().updateGlobal(Config.BOT, botCfg);

    return ctx.interactionApi.respondWithMessage(
      'Bot status updated to ' + bold(`${STATUSES[status]} - ${message}`),
    );
  },
});

export default setStatus;
