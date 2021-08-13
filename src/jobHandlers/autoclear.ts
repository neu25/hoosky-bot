import dayjs from 'dayjs';
import { JobHandler, JobType } from './index';

export type AutoclearJobData = {
  guildId: string;
};

const autoclear: JobHandler<JobType.AUTOCLEAR> = async ctx => {
  const { guildId } = ctx.data;

  const today = dayjs();

  const channels = await (await ctx.repos.autoclear.scan(guildId)).toArray();
  console.log(channels);

  for (const channel of channels) {
    await ctx.auditLogger.logMessage(guildId, {
      description: `Automatically clearing old messages in <#${channel._id}>`,
    });
    const beforeTime = today.add(-channel.duration, 'hour');

    let messages = await ctx.api.getMessages(channel._id, 100);
    while (
      messages.length > 0 &&
      beforeTime.isBefore(messages[messages.length - 1].timestamp)
    ) {
      messages = await ctx.api.getMessages(channel._id, 100, {
        before: messages[messages.length - 1].id,
      });
    }

    if (messages.length === 0) {
      continue;
    }

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
      messages = (
        await ctx.api.getMessages(channel._id, 100, {
          before: anchorMessage.id,
        })
      ).filter(message => twoWeeks.isBefore(message.timestamp));

      if (messages.length >= 2) {
        await ctx.api.bulkDeleteMessages(
          channel._id,
          messages.map(message => message.id),
        );
      } else if (messages.length === 1) {
        await ctx.api.deleteMessage(channel._id, messages[0].id);
      }
    }

    await ctx.api.deleteMessage(channel._id, anchorMessage.id);
  }
};

export default autoclear;
