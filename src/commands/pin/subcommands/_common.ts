import ExecutionContext from '../../../ExecutionContext';

export const respondWithNoPinsConfig = (
  ctx: ExecutionContext,
): Promise<void> => {
  return ctx.interactionApi.respondWithError(
    `Unable to fetch pins configuration.`,
  );
};

type ExtractedIDs = {
  channelId: string;
  messageId: string;
};

export const extractIDsFromMessageLink = (link: string): ExtractedIDs => {
  // Parse message link.
  const ids = link.substr(link.indexOf('/channels/') + 10).split('/');
  const channelId = ids[1];
  const messageId = ids[2];
  return { channelId, messageId };
};
