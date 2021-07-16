import dayjs from 'dayjs';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import ExecutionContext from '../../../ExecutionContext';

const validateDate = (date: string): boolean => {
  return /^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(date);
};

const respondWithInvalidDate = (ctx: ExecutionContext): Promise<void> => {
  return ctx.interactionApi.respondWithError(`Invalid date.`);
};

export const create = new SubCommand({
  name: 'create',
  displayName: 'New Countdown',
  description: 'Create a new countdown',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  options: [
    new CommandOption({
      name: 'date',
      description: 'Date of event (MM/DD/YYYY)',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
    new CommandOption({
      name: 'name',
      description: 'Name of event to count down to',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
    new CommandOption({
      name: 'channel',
      description: 'Channel to announce countdown in',
      required: true,
      type: Discord.CommandOptionType.CHANNEL,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const dateString = ctx.getArgument<string>('date')!.trim();
    const eventName = ctx.getArgument<string>('name')!.trim();
    const channel = ctx.getArgument<string>('channel')!.trim();

    const date = dayjs(dateString, 'MM/DD/YYYY');
    if (!validateDate(dateString) || !date.isValid()) {
      return respondWithInvalidDate(ctx);
    }

    await ctx.countdowns().create(guildId, date.format('YYYY-MM-DD'), {
      name: eventName,
      channel: channel,
    });

    return ctx.interactionApi.respondWithMessage(
      `New countdown "${eventName}" created: ${date.format('MMMM D, YYYY')}`,
    );
  },
});
