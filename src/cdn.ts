import * as Discord from './Discord';

const BASE_URL = 'https://cdn.discordapp.com';

export const authorAvatarUrl = (author: Discord.Message['author']): string => {
  return author.avatar
    ? userAvatarUrl(author.id, author.avatar)
    : defaultAvatarUrl(author.discriminator);
};

export const defaultAvatarUrl = (
  discriminator: string,
  size?: number,
): string => {
  let url = `${BASE_URL}/embed/avatars/${Number(discriminator) % 5}.png`;
  if (size) {
    url += '?size=' + size;
  }
  return url;
};

export const userAvatarUrl = (
  userId: string,
  avatarId: string,
  size?: number,
): string => {
  let url = `${BASE_URL}/avatars/${userId}/${avatarId}.png`;
  if (size) {
    url += '?size=' + size;
  }
  return url;
};
