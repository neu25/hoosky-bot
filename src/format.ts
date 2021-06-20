/**
 * Bolds the supplied text using Discord's syntax.
 *
 * @param text The text to bold.
 */
export const bold = (text: string): string => `**${text}**`;

/**
 * Italicizes the supplied text using Discord's syntax.
 *
 * @param text The text to italicize.
 */
export const italics = (text: string): string => `*${text}*`;

/**
 * Places the supplied text in an inline code block using Discord's syntax.
 *
 * @param text The text to place in an inline code block.
 */
export const inlineCode = (text: string): string => `\`${text}\``;

/**
 * Returns a formatted string of boxed text within a horizontal line.
 * This method is primarily used for fancy formatting of bot responses.
 *
 * Example:
 * `centerText('ENGW', 16)` -> `────[ ENGW ]────`
 *
 * @param text The heading.
 * @param width The desired end width;
 */
export const fancyCenter = (text: string, width: number): string => {
  const box = `[ ${text} ]`;
  const dashLength = width - box.length;
  return inlineCode(
    '─'.repeat(Math.floor(dashLength / 2)) +
      box +
      '─'.repeat(Math.ceil(dashLength / 2)),
  );
};
