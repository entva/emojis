import { collection, emojiRegex, shortnameRegex } from '../vendor/emojis.json';
import {
  getOptions,
  sanitize,

  hexToImage,

  shortnameToEmoji,
  unicodeToEmoji,

  shortnameToUnicode,
  unicodeToShortname,

  type Options,
} from './utils';

// If strange bugs appear, create new regex in each function
const regexShortname = new RegExp(shortnameRegex, 'g');
const regexUnicode = new RegExp(emojiRegex, 'g');
const regexAny = new RegExp(`^(${shortnameRegex}|${emojiRegex})$`);

export const isSingleEmoji = (string?: string) => {
  if (typeof string !== 'string' || !string) return false;
  return regexAny.test(string.trim());
};

export const shortnamesToUnicode = (string?: string) => {
  if (typeof string !== 'string') return null;
  return string.replace(regexShortname, shortnameToUnicode);
};
export const unicodeToShortnames = (string?: string) => {
  if (typeof string !== 'string') return null;
  return string.replace(regexUnicode, unicodeToShortname);
};

export const renderShortname = (string?: string, settings?: Partial<Options>) => {
  if (typeof string !== 'string') return null;
  const options = getOptions(settings);

  const compile = (shortname: string) => {
    const emoji = shortnameToEmoji(shortname);
    // do nothing if shortcode is not recognized
    if (!emoji) return shortname;
    return hexToImage(emoji.hex, options);
  };

  // Trust string in "single character" mode
  if (options.single) return compile(string);
  return sanitize(string, options).replace(regexShortname, compile);
};

export const render = (string?: string, settings?: Partial<Options>) => {
  if (typeof string !== 'string') return null;
  const options = getOptions(settings);

  const compile = (unicode: string) => {
    const emoji = unicodeToEmoji(unicode);
    // do nothing if unicode is not recognized
    if (!emoji) return unicode;
    return hexToImage(emoji.hex, options);
  };

  // Trust string in "single character" mode
  if (options.single) return compile(string);
  return sanitize(string, options).replace(regexUnicode, compile);
};

export { collection as emojiCollection, emojiRegex, shortnameRegex };
