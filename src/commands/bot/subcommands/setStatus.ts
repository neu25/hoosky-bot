import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import CommandOptionChoice from '../../../CommandOptionChoice';
import { bold } from '../../../format';

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
  description: 'Sets the activity status of the bot',
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
      description: 'Show a "Playing [message]" status message',
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const message = ctx.getArgument<string>('message');
    const status = ctx.getArgument<string>('status') as Discord.StatusType;

    const activity: Discord.Activity = message
      ? {
          // Discord only allows status messages for bots if they are prefixed by
          // "Playing", "Listening to", "Streaming", etc.
          name: message,
          type: Discord.ActivityType.Game,
          created_at: Date.now(),
        }
      : {
          name: '',
          type: Discord.ActivityType.Custom,
          created_at: Date.now(),
        };

    ctx.client.updatePresence({
      activities: [activity],
      since: null,
      afk: false,
      status,
    });
    return ctx.interactionApi.respondWithMessage(
      'Bot status updated to ' + bold(`${STATUSES[status]} - ${message}`),
    );
  },
});

export default setStatus;
