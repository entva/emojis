/* eslint no-bitwise: "off" */
const fs = require('fs');
const path = require('path');

const { Trie } = require('regexgen');
const uniq = require('lodash.uniq');
const difference = require('lodash.difference');

const { hexToId, fromCodePoint } = require('../lib/conversions');

const { logResult } = require('./utils/log');
const { getVersion: getUnicodeVersion } = require('./utils/unicode');
const { getVersion: getAssetsVersion } = require('./utils/assets');
const { getUnicodeSpec } = require('./utils/data');

const { SUGGESTABLE_UNICODE_VERSION } = require('./utils/versions');

const FULL_REPRESENTATION = 'fully-qualified';


// These are not to be shown in the suggestions because they are nonsense
const SKIPPED_CATEGORIES = [
  'flags',
  'modifier',
  'extras',
  'regional',
];

const OUTPUT = path.resolve(`${__dirname}/../vendor/emojis.json`);

const familyRegex = /^:family_/;
const clockRegex = /^:clock/;
const shapeRegex = /_(diamond|square|triangle|circle|sign):$/;

const isSuggestable = (hash, key) => {
  const { shortname, display, diversity, category, unicode_version: version } = hash[key].data;

  const isDisplayable = Boolean(display);
  const isOptional = Boolean(diversity);
  const isSkipped = SKIPPED_CATEGORIES.includes(category);
  const isDesirable = [
    familyRegex,
    clockRegex,
    shapeRegex,
  ].every((regex) => !regex.test(shortname));

  const isSupported = SUGGESTABLE_UNICODE_VERSION >= version;

  return isDisplayable && !isOptional && !isSkipped && isDesirable && isSupported;
};

const getEmojiData = (spec, assets) => spec.reduce((acc, item) => {
  const { codePoint: hex, qualified } = item;
  const key = hexToId(hex);

  if (!assets[key]) {
    console.warn(`Coundn't find ${key} in the assets data`);
    return acc;
  }

  if (!acc[key]) acc[key] = { codePoints: [], data: assets[key] };
  acc[key].codePoints.push({ hex, qualified });

  return acc;
}, {});

const getCollection = (hash) => {
  const keys = Object.keys(hash);

  keys.sort((keyA, keyB) => hash[keyA].data.order - hash[keyB].data.order);

  return keys.reduce((acc, key) => {
    const { codePoints, data: { category, shortname } } = hash[key];
    const fullyQualified = codePoints.find(({ qualified }) => qualified === FULL_REPRESENTATION);
    const { hex } = fullyQualified || codePoints[0];
    const suggest = isSuggestable(hash, key);

    acc.push({ category, shortname, hex, suggest });

    return acc;
  }, []);
};

const getRegex = (hash) => {
  const keys = Object.keys(hash);

  const allCodes = keys.reduce((acc, key) => (
    acc.concat(hash[key].codePoints.map(({ hex }) => hex))
  ), []);

  const codes = uniq(allCodes);

  const compare = (a, b) => {
    // TODO: Remove sorting logic once the upstream bug is addressed.
    // https://github.com/devongovett/regexgen/issues/31
    // Longest strings first.
    const aLength = a.length;
    const bLength = b.length;
    if (aLength > bLength) return -1;
    if (aLength < bLength) return 1;
    // Lengths are equal; sort lexicographically from a-z.
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  };

  // Sort by length (longest first) to avoid partial matches
  codes.sort(compare);

  // Important to sort before converting, JS engine can't sort unicode sequences properly
  const sequences = codes.map((hex) => hex.split('-').map(fromCodePoint).join(''));

  const trie = new Trie();
  trie.addAll(sequences);

  // Some systems add extra FE0F, we match that here
  return `(${trie.toString()})\\uFE0F?`;
};

const runTask = async (string) => {
  const unicodeVersion = getUnicodeVersion(string);
  const specArray = await getUnicodeSpec(unicodeVersion);
  const assetHash = require('emoji-assets/emoji');
  const processedHash = getEmojiData(specArray, assetHash);

  const resultsDiff = difference(Object.keys(assetHash), Object.keys(processedHash));
  if (resultsDiff.length) {
    console.log(`${resultsDiff.length} keys were omitted by the spec:`, resultsDiff.join(', '));
  }

  const collection = getCollection(processedHash);
  const emojiRegex = getRegex(processedHash);

  const shortnameRegex = '(:[\\w-]+:)';
  const total = collection.length;
  const assetsVersion = getAssetsVersion();

  const json = { collection, emojiRegex, shortnameRegex, total, unicodeVersion, assetsVersion };
  const content = `${JSON.stringify(json, null, 2)}\n`;
  fs.writeFileSync(OUTPUT, content);

  return logResult(`Created ${total} entries, results saved to ${OUTPUT}`);
};

module.exports = runTask;
