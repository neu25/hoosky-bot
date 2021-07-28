import dayjs from 'dayjs';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { bold } from '../../../format';
import { respondWithInvalidDate, validateDate } from '../_common';

const create = new SubCommand({
  name: 'create',
  displayName: 'Create Countdown',
  description: 'Create a new countdown',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  options: [
    new CommandOption({
      name: 'date',
      description: 'Date of event (MM/DD/YY)',
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

    const date = dayjs(dateString, 'MM/DD/YY');
    if (!validateDate(dateString) || !date.isValid()) {
      return respondWithInvalidDate(ctx);
    }

    await ctx.countdowns().create(guildId, date.format('YYYY-MM-DD'), {
      name: eventName,
      channel: channel,
    });

    return ctx.interactionApi.respondWithMessage(
      `${bold(eventName)} countdown to ${bold(
        date.format('MMMM D, YYYY'),
      )} created.`,
    );
  },
});

export default create;
