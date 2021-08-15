import parse from 'parse-duration';
import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
import { bold, inlineCode } from '../../../format';
import { runAutoclears } from '../../../jobHandlers/autoclear';
import { formatMsLong } from '../../../utils';
import SubCommand from '../../../SubCommand';

const enable = new SubCommand({
  name: 'enable',
  displayName: 'Enable Autoclear',
  description: 'Automatically clear messages in a channel hourly',
  requiredPermissions: [Discord.Permission.MANAGE_CHANNELS],
  options: [
    new CommandOption({
      name: 'channel',
      description: 'Channel to automatically clear',
      required: true,
      type: Discord.CommandOptionType.CHANNEL,
    }),
    new CommandOption({
      name: 'expiration',
      description:
        'Messages older than this time are deleted (e.g., `24 hours`. Must be at least 1 hour)',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const channel = ctx.getArgument<string>('channel')!;
    const durationString = ctx.getArgument<string>('expiration')!;

    const durationMs = parse(durationString);
    if (durationMs === null) {
      return ctx.interactionApi.respondWithError(
        [
          bold('Invalid duration.'),
          'Example valid durations include',
          inlineCode('1h 20m'),
          'and',
          inlineCode('2 days') + '.',
        ].join(' '),
      );
    }

    // Duration must be at least an hour.
    if (durationMs < 60 * 60 * 1000) {
      return ctx.interactionApi.respondWithMessage(
        [
          'Autoclear expiration must be at least',
          bold('1 hour') + '.',
          'You supplied a time of',
          bold(formatMsLong(durationMs)) + '.',
        ].join(' '),
      );
    }

    await ctx.autoclears().set(guildId, channel, durationMs);

    await ctx.interactionApi.respondWithMessage(
      [
        `Messages in <#${channel}>`,
        'older than',
        bold(formatMsLong(durationMs)),
        'will be automatically cleared.',
      ].join(' '),
    );

    const autoclears = await ctx.autoclears().list(guildId);
    await runAutoclears(ctx.api, ctx.auditLogger, guildId, autoclears);
  },
});

export default enable;
