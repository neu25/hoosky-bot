import dayjs from 'dayjs';
import { Autoclear } from '../repository/AutoclearRepo';
import AuditLogger from '../auditLogger';
import Api from '../Api';
import { formatMsLong } from '../utils';
import { JobHandler, JobType } from './index';

export type AutoclearJobData = {
  guildId: string;
};

export const runAutoclears = async (
  api: Api,
  auditLogger: AuditLogger,
  guildId: string,
  autoclears: Autoclear[],
): Promise<void> => {
  const today = dayjs();

  for (const ac of autoclears) {
    await auditLogger.logMessage(guildId, {
      description: [
        `Clearing messages in <#${ac._id}>`,
        `older than`,
        formatMsLong(ac.duration) + '.',
      ].join(' '),
    });
    const beforeTime = today.add(-ac.duration);

    // Find set of messages with at least one message before `beforeTime`.
    let messages = await api.getMessages(ac._id, 100);
    while (
      messages.length > 0 &&
      beforeTime.isBefore(messages[messages.length - 1].timestamp)
    ) {
      messages = await api.getMessages(ac._id, 100, {
        before: messages[messages.length - 1].id,
      });
    }

    if (messages.length === 0) {
      continue;
    }

    // Find first message before `beforeTime`.
    let anchorMessage = messages[0];
    for (
      let i = 0;
      i < messages.length && beforeTime.isBefore(anchorMessage.timestamp);
      i++
    ) {
      anchorMessage = messages[i];
    }

    const twoWeeks = today.add(-14, 'day');

    while (messages.length > 0) {
      // Find messages before `anchorMessage` that are less than two weeks old.
      messages = (
        await api.getMessages(ac._id, 100, {
          before: anchorMessage.id,
        })
      ).filter(message => twoWeeks.isBefore(message.timestamp));

      // Delete those messages.
      if (messages.length >= 2) {
        await api.bulkDeleteMessages(
          ac._id,
          messages.map(message => message.id),
        );
      } else if (messages.length === 1) {
        await api.deleteMessage(ac._id, messages[0].id);
      }
    }

    // Delete `anchorMessage`.
    await api.deleteMessage(ac._id, anchorMessage.id);
  }
};

const autoclear: JobHandler<JobType.AUTOCLEAR> = async ctx => {
  const { guildId } = ctx.data;

  const autoclears = await ctx.repos.autoclear.list(guildId);
  return runAutoclears(ctx.api, ctx.auditLogger, guildId, autoclears);
};

export default autoclear;
