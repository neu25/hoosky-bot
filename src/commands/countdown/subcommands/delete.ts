import dayjs from 'dayjs';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { bold } from '../../../format';
import {
  respondWithInvalidDate,
  respondWithNotFound,
  validateDate,
} from '../_common';

const del = new SubCommand({
  name: 'delete',
  displayName: 'Delete Countdown',
  description: 'Delete a countdown',
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
      description: 'Name of the event to delete',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const dateString = ctx.getArgument<string>('date')!.trim();
    const eventName = ctx.getArgument<string>('name')!.trim();

    if (!validateDate(dateString)) {
      return respondWithInvalidDate(ctx);
    }

    const date = dayjs(dateString, 'MM/DD/YY');
    if (!date.isValid()) {
      return respondWithInvalidDate(ctx);
    }

    const dateKey = date.format('YYYY-MM-DD');
    const dateObj = await ctx.countdowns().getByDate(guildId, dateKey);
    if (!dateObj) {
      return respondWithNotFound(ctx, date, eventName);
    }

    const exists = dateObj.events.findIndex(
      ev => ev.name.toLowerCase() === eventName.toLowerCase(),
    );
    if (exists === -1) {
      return respondWithNotFound(ctx, date, eventName);
    }

    await ctx.countdowns().deleteEvent(guildId, dateKey, eventName);

    return ctx.interactionApi.respondWithMessage(
      `${bold(eventName)} countdown to ${bold(
        date.format('MMMM D, YYYY'),
      )} deleted.`,
    );
  },
});

export default del;
