import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import parse from 'parse-duration';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import {
  checkMutePermissionsOrExit,
  createUnmuteJob,
  getMuteRoleOrExit,
} from '../_common';
import { bold, inlineCode } from '../../../format';
import { formatDuration } from '../../../utils';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const add = new SubCommand({
  name: 'add',
  displayName: 'Add Mute',
  description: 'Mutes a user',
  requiredPermissions: [Discord.Permission.KICK_MEMBERS],
  options: [
    new CommandOption({
      name: 'user',
      description: 'The user to mute',
      required: true,
      type: Discord.CommandOptionType.USER,
    }),
    new CommandOption({
      name: 'duration',
      description:
        'The duration of the mute (e.g., `55 min` or `2d 4h`. Omit for a permanent mute)',
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const targetUserId = ctx.getArgument<string>('user')!;
    const durationString = ctx.getArgument<string>('duration');

    if (!(await checkMutePermissionsOrExit(ctx, guildId, targetUserId))) return;

    let durationMs = 0;
    if (durationString) {
      const parsed = parse(durationString);
      if (parsed === null) {
        return ctx.interactionApi.respondWithError(
          [
            bold('Invalid duration.'),
            ' Example valid durations include ',
            inlineCode('55 min'),
            ' and ',
            inlineCode('2d 4h'),
            `. Omit `,
            bold('duration'),
            ` for a permanent mute.`,
          ].join(''),
        );
      }
      durationMs = parsed;
    }

    // Get the muted role.
    const mutedRole = await getMuteRoleOrExit(ctx, guildId);
    if (!mutedRole) return;

    // Give the user the `muted` role.
    try {
      await ctx.api.addRoleToMember(guildId, targetUserId, mutedRole);
    } catch (e) {
      // Error code 50013:	You lack permissions to perform that action.
      if (e.code === 50013) {
        await ctx.interactionApi.respondWithError(
          `Couldn’t assign the Muted role. Move HooskBot’s role higher.`,
        );
        return;
      }
      // Unknown error.
      throw e;
    }

    const user = await ctx.api.getUser(targetUserId);
    let muteMsg = `Muted ${bold(`${user.username}#${user.discriminator}`)}`;

    if (durationMs > 0) {
      const targetDate = new Date(Date.now() + durationMs);
      await createUnmuteJob(ctx, targetUserId, targetDate);

      const durationStr = formatDuration(dayjs.duration(durationMs));
      muteMsg += ' for ' + bold(`${durationStr}.`);
    } else {
      muteMsg += ' ' + bold('indefinitely.');
    }

    // Get info about the user and provide a response message.
    await ctx.interactionApi.respondWithMessage(muteMsg);
  },
});

export default add;
