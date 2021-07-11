import * as Discord from '../../Discord';

export const transformAttachmentsToEmbeds = (
  attachments: Discord.Attachment[],
): Discord.Embed[] => {
  const embeds: Discord.Embed[] = [];

  for (const att of attachments) {
    if (att.content_type?.startsWith('image')) {
      embeds.push({
        title: 'Attachment',
        image: {
          url: att.url,
          proxy_url: att.proxy_url,
          width: att.width,
          height: att.height,
        },
      });
    } else {
      embeds.push({
        title: 'Attachment',
        fields: [
          {
            name: 'Filename',
            value: att.filename,
          },
          {
            name: 'Link',
            value: att.url,
          },
        ],
      });
    }
  }

  return embeds;
};
