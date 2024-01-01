import { collection, emojiRegex, shortnameRegex } from '../vendor/emojis.json';
import {
  getOptions,
  sanitize,

  hexToImage,
  getImageData,

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

export const renderShortnameToString = (string?: string, settings?: Partial<Options>) => {
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

export const renderToString = (string?: string, settings?: Partial<Options>) => {
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

export type RenderCallback<T> = (id: string, symbol: string, index: number) => T;
export type RenderedArray<T> = (string | T)[];
export const renderToArray = <T = unknown>(string?: string, callback?: RenderCallback<T>) => {
  if (typeof string !== 'string') return null;
  if (typeof callback !== 'function') return [string];

  const compile = (acc: RenderedArray<T>, unicode: string, index: number) => {
    // filter out empty strings
    if (!unicode) return acc;

    const emoji = unicodeToEmoji(unicode);

    // do nothing if unicode is not recognized
    if (!emoji) {
      acc.push(unicode);
      return acc;
    }

    const { id, symbol } = getImageData(emoji.hex);
    const result = callback(id, symbol, index);
    if (result) acc.push(result);
    return acc;
  };

  return string.split(regexUnicode).reduce(compile, [] as RenderedArray<T>);
};

export { collection as emojiCollection, emojiRegex, shortnameRegex };
