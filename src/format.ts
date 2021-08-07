export const DEFAULT_HEADING_WIDTH = 30;

export const EM_SPACE = ' ';
export const EN_SPACE = ' ';

export const hyperlink = (text: string, url: string): string => {
  return `[${text}](${url})`;
};

/**
 * Returns a plural version (with an appended `s`) of the provided word if the
 * `count` isn't equal to 1.
 *
 * @param word The singular word.
 * @param count The count of the word.
 */
export const pluralize = (word: string, count: number): string => {
  return count === 1 ? word : word + 's';
};

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
 * Underlines the supplied text using Discord's syntax.
 *
 * @param text The text to underline.
 */
export const underline = (text: string): string => `__${text}__`;

/**
 * Places the supplied text in an inline code block using Discord's syntax.
 *
 * @param text The text to place in an inline code block.
 */
export const inlineCode = (text: string): string => `\`${text}\``;

/**
 * Places the supplied text in a multiline code block using Discord's syntax.
 *
 * @param text The text to place in a multiline code block.
 * @param language The language of the text (e.g., js, bash, json).
 */
export const multilineCode = (
  text: string,
  language = '',
): string => `\`\`\`${language}
${text}
\`\`\``;

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
export const fancyCenter = (
  text: string,
  width = DEFAULT_HEADING_WIDTH,
): string => {
  const box = `[ ${text} ]`;
  const dashLength = width - box.length;
  return inlineCode(
    '─'.repeat(Math.floor(dashLength / 2)) +
      box +
      '─'.repeat(Math.ceil(dashLength / 2)),
  );
};
