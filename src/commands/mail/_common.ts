import * as Discord from '../../Discord';
import { CreateChannelPayload, ModifyChannelPayload } from '../../Discord';
import ExecutionContext from '../../ExecutionContext';
import { Config } from '../../database';

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

export const blockUserMail = (
  ctx: ExecutionContext,
  userId: string,
): Promise<unknown> => {
  return ctx
    .config()
    .globalCollection()
    .updateOne(
      {
        _id: Config.MAIL,
      },
      {
        $addToSet: {
          'value.blockedUserIds': userId,
        },
      },
    );
};

export const unblockUserMail = (
  ctx: ExecutionContext,
  userId: string,
): Promise<unknown> => {
  return ctx
    .config()
    .globalCollection()
    .updateOne(
      {
        _id: Config.MAIL,
      },
      {
        $pull: {
          'value.blockedUserIds': userId,
        },
      },
    );
};

export const notifyOfBlock = (
  ctx: ExecutionContext,
  userId: string,
): Promise<unknown> => {
  return ctx.interactionApi.respondWithEmbed({
    title: 'User blocked',
    description: `Mail from <@${userId}> will no longer be forwarded`,
    type: Discord.EmbedType.RICH,
    color: Discord.Color.DANGER,
    timestamp: new Date().toISOString(),
  });
};

export const notifyOfUnblock = (
  ctx: ExecutionContext,
  userId: string,
): Promise<unknown> => {
  return ctx.interactionApi.respondWithEmbed({
    title: 'User unblocked',
    description: `Mail from <@${userId}> will now be forwarded`,
    type: Discord.EmbedType.RICH,
    color: Discord.Color.PRIMARY,
    timestamp: new Date().toISOString(),
  });
};
