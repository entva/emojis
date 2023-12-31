import escapeHtml from 'escape-html';
import { hexToId, unicodeToCodePoint, codePointToUnicode } from './conversions';
import { collection, assetsVersion } from '../vendor/emojis.json';

const AVAILABLE_SIZES = {
  32: true,
  64: true,
  128: true,
};

const defaultOptions: Options = {
  size: 64,
  className: null,
  unsafe: false,
  single: false,
};

export type Options = {
  size: keyof typeof AVAILABLE_SIZES, // size of emojis to use when the default CDN is used
  className: string | null, // CSS class to use when rendering image tags
  unsafe: boolean, // when set to true, render will NOT sanitize the string
  single: boolean, // when a string contains just a single emoji this speeds up render a bit
  cdn?: string, // a CDN to use for image paths
};

export type CollectionItem = typeof collection[0];

export const imagePath = `/images/emojis-${assetsVersion}`;

export const codepointsHash = collection.reduce((acc, item) => {
  acc[hexToId(item.hex)] = item;
  return acc;
}, {} as Record<string, CollectionItem>);
export const shortnamesHash = collection.reduce((acc, item) => {
  acc[item.shortname] = item;
  return acc;
}, {} as Record<string, CollectionItem>);

export const unicodeToEmoji = (unicode: string): CollectionItem | undefined => (
  codepointsHash[hexToId(unicodeToCodePoint(unicode))]
);
export const shortnameToEmoji = (shortname: string): CollectionItem | undefined => (
  shortnamesHash[shortname]
);

export const shortnameToUnicode = (shortname: string) => {
  const emoji = shortnamesHash[shortname];

  // do nothing if shortcode is not recognized
  if (!emoji) return shortname;
  return codePointToUnicode(emoji.hex);
};

export const unicodeToShortname = (unicode: string) => {
  const emoji = unicodeToEmoji(unicode);

  // do nothing if unicode is not recognized
  if (!emoji) return unicode;
  return emoji.shortname;
};

export const sanitize = (string: string, options: Options) => (
  (options && options.unsafe) ? string : escapeHtml(string)
);
export const getOptions = (options?: Partial<Options>) => ({ ...defaultOptions, ...options });

export const getImageSrc = (icon: string, prefix: string | Options['size']) => {
  let cdn = prefix;

  if (typeof prefix !== 'string') {
    const imageSize = AVAILABLE_SIZES[prefix] ? prefix : 64;
    cdn = `${imagePath}/${imageSize}`;
  }

  return `${cdn}/${icon}.png`;
};

export const hexToImage = (hex: string, options?: Options) => {
  const { size, className, cdn } = getOptions(options);
  const id = hexToId(hex);
  const src = getImageSrc(id, cdn || size);
  const alt = codePointToUnicode(hex);

  let propsString = `draggable="false" data-emoji="${id}"`;
  if (className) propsString += ` class="${className}"`;

  return `<img src="${src}" alt="${alt}" ${propsString} />`;
};
