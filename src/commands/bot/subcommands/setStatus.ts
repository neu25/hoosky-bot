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
  ],
  handler: async ctx => {
    const status = ctx.getArgument<string>('status') as Discord.StatusType;
    ctx.client.updatePresence({
      activities: [
        {
          name: '',
          type: Discord.ActivityType.Custom,
          created_at: Date.now(),
        },
      ],
      since: null,
      afk: false,
      status,
    });
    return ctx.interactionApi.respondWithMessage(
      `Bot status updated to ${bold(STATUSES[status])}`,
    );
  },
});

export default setStatus;
