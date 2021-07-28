import dayjs from 'dayjs';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { bold } from '../../../format';

const del = new SubCommand({
  name: 'delete',
  displayName: 'Delete Countdown',
  description: 'Delete a countdown',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  options: [
    new CommandOption({
      name: 'id',
      description: 'Event ID',
      required: true,
      type: Discord.CommandOptionType.INTEGER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const eventId = ctx.getArgument<number>('id')!;

    // Find date based on event.
    const date = await ctx.countdowns().getById(guildId, eventId);
    if (!date) {
      return ctx.interactionApi.respondWithError(
        "Event not found. Find an event's ID by running `/countdown list`.",
      );
    }

    // Find event data from returned date.
    const eventData = date.events.filter(ev => {
      if (ev.id === eventId) {
        return ev;
      }
    });
    if (!eventData) {
      return ctx.interactionApi.respondWithError(
        "Event not found. Find an event's ID by running `/countdown list`.",
      );
    }

    // Delete event.
    await ctx.countdowns().deleteEvent(guildId, date._id, eventId);

    return ctx.interactionApi.respondWithMessage(
      `${bold(eventData[0].name)} countdown to ${bold(
        dayjs(date._id).format('MMMM D, YYYY'),
      )} deleted.`,
    );
  },
});

export default del;
