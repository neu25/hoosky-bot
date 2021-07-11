import { CreateChannelPayload, ModifyChannelPayload } from '../../Discord';
import * as Discord from '../../Discord';

export const generateChannelData = <
  D extends CreateChannelPayload | ModifyChannelPayload,
>(
  username: string,
  discriminator: string,
  categoryId?: string,
): D => {
  return {
    name: generateChannelName(username, discriminator),
    type: Discord.ChannelType.GUILD_TEXT,
    topic: generateChannelTopic(username, discriminator),
    parent_id: categoryId,
  } as D;
};

export const generateChannelTopic = (
  username: string,
  discriminator: string,
): string => {
  return `Mail thread with ${username}#${discriminator}`;
};

export const generateChannelName = (
  username: string,
  discriminator: string,
): string => {
  return `${username}-${discriminator}`;
};
