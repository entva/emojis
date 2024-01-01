const escapeHtml = require('escape-html');
const assert = require('node:assert/strict');

const {
  isSingleEmoji,
  shortnamesToUnicode,
  unicodeToShortnames,

  renderShortnameToString,
  renderToString,
  renderToArray,

  emojiCollection,
  emojiRegex,
  shortnameRegex,
} = require('../lib');

const { imagePath } = require('../lib/utils');

const { emoji, tone, mixed, specialSpacer, specialEnder } = require('../scaffolding/emojis');


describe('emojitsu', () => {
  it('isSingleEmoji', () => {
    const singleEmoji = ':banana:';
    const singleUnicode = '🤷🏻‍♂️';
    const singleLetter = 'x';
    const singleEmojiWithSpace = '    :penis:   ';
    const randomMessage = 'you my good Sir are a :penis:';
    const randomMessage2 = 'you my good Sir are a 💩';

    assert.equal(isSingleEmoji(), false, 'handles empty arguments');
    assert.equal(isSingleEmoji(''), false, 'handles empty string');
    assert.equal(isSingleEmoji(singleEmoji), true, 'detects single emoji');
    assert.equal(isSingleEmoji(singleUnicode), true, 'detects single unicode emoji');
    assert.equal(isSingleEmoji(singleEmojiWithSpace), true, 'detects malformed single emoiji');
    assert.equal(isSingleEmoji(singleLetter), false, 'single letter');
    assert.equal(isSingleEmoji(randomMessage), false, 'doesn\'t report false positives');
    assert.equal(isSingleEmoji(randomMessage2), false, 'doesn\'t report false positives');
  });

  it('shortnamesToUnicode', () => {
    const long1 = [
      specialEnder.shortname,
      specialSpacer.shortname,
      mixed.shortname,
      tone.shortname,
      emoji.shortname,
    ].join('');

    const long2 = `is ${specialSpacer.shortname}${specialEnder.shortname} good ${tone.shortname} k`;

    const expected1 = [
      specialEnder.unicode,
      specialSpacer.unicode,
      mixed.unicode,
      tone.unicode,
      emoji.unicode,
    ].join('');

    const expected2 = `is ${specialSpacer.unicode}${specialEnder.unicode} good ${tone.unicode} k`;

    const missing = ':topkek:';

    assert.equal(shortnamesToUnicode(), null, 'no arguments');
    assert.equal(shortnamesToUnicode(null), null, 'null');
    assert.equal(shortnamesToUnicode(''), '', 'empty string');

    assert.equal(shortnamesToUnicode(missing), missing, 'doesn\'t touch unknown input');
    assert.equal(shortnamesToUnicode(emoji.shortname), emoji.unicode, 'returns correct data');
    assert.equal(shortnamesToUnicode(tone.shortname), tone.unicode, 'returns correct data toned');
    assert.equal(shortnamesToUnicode(mixed.shortname), mixed.unicode, 'returns correct data mixed');
    assert.equal(shortnamesToUnicode(specialSpacer.shortname), specialSpacer.unicode, 'returns correct data 200d');
    assert.equal(shortnamesToUnicode(specialEnder.shortname), specialEnder.unicode, 'returns correct data fe0f');

    assert.equal(shortnamesToUnicode(long1), expected1, 'long string no spaces');
    assert.equal(shortnamesToUnicode(long2), expected2, 'long string mixed with spaces');
  });

  it('unicodeToShortnames', () => {
    const long1 = [
      specialEnder.unicode,
      specialSpacer.unicode,
      mixed.unicode,
      tone.unicode,
      emoji.unicode,
    ].join('');

    const long2 = `is ${specialSpacer.unicode}${specialEnder.unicode} good ${tone.unicode} k`;

    const expected1 = [
      specialEnder.shortname,
      specialSpacer.shortname,
      mixed.shortname,
      tone.shortname,
      emoji.shortname,
    ].join('');

    const expected2 = `is ${specialSpacer.shortname}${specialEnder.shortname} good ${tone.shortname} k`;

    const missing = '€';

    assert.equal(unicodeToShortnames(), null, 'no arguments');
    assert.equal(unicodeToShortnames(null), null, 'null');
    assert.equal(unicodeToShortnames(''), '', 'empty string');

    assert.equal(unicodeToShortnames(missing), missing, 'doesn\'t touch unknown input');
    assert.equal(unicodeToShortnames(emoji.unicode), emoji.shortname, 'returns correct data');
    assert.equal(unicodeToShortnames(tone.unicode), tone.shortname, 'returns correct data toned');
    assert.equal(unicodeToShortnames(mixed.unicode), mixed.shortname, 'returns correct data mixed');
    assert.equal(unicodeToShortnames(specialSpacer.unicode), specialSpacer.shortname, 'returns correct data 200d');
    assert.equal(unicodeToShortnames(specialEnder.unicode), specialEnder.shortname, 'returns correct data fe0f');

    assert.equal(unicodeToShortnames(long1), expected1, 'long string no spaces');
    assert.equal(unicodeToShortnames(long2), expected2, 'long string mixed with spaces');
  });

  it('renderShortnameToString', () => {
    const expectedEmoji = `<img src="${imagePath}/64/1f953.png" alt="🥓" draggable="false" data-emoji="1f953" />`;
    const expectedToned = `<img src="${imagePath}/64/1f44d-1f3ff.png" alt="👍🏿" draggable="false" data-emoji="1f44d-1f3ff" />`;
    const expectedMixed = `<img src="${imagePath}/64/1f469-1f469-1f466.png" alt="👩‍👩‍👦" draggable="false" data-emoji="1f469-1f469-1f466" />`;
    const expectedSpecialSpacer = `<img src="${imagePath}/64/1f469-1f3fd-1f680.png" alt="👩🏽‍🚀" draggable="false" data-emoji="1f469-1f3fd-1f680" />`;
    const expectedSpecialEnder = `<img src="${imagePath}/64/1f468-1f3ff-2708.png" alt="👨🏿‍✈️" draggable="false" data-emoji="1f468-1f3ff-2708" />`;

    const shortnameMix = [
      specialEnder.shortname,
      specialSpacer.shortname,
      mixed.shortname,
      tone.shortname,
      emoji.shortname,
    ].join('');

    const textShortnameMix = `is ${specialSpacer.shortname}${specialEnder.shortname} good ${tone.shortname} k`;

    const expectedMix = [
      expectedSpecialEnder,
      expectedSpecialSpacer,
      expectedMixed,
      expectedToned,
      expectedEmoji,
    ].join('');
    const expectedTextMix = `is ${expectedSpecialSpacer}${expectedSpecialEnder} good ${expectedToned} k`;

    const HTML = `<span>${specialEnder.shortname}</span>`;
    const escapedHTML = escapeHtml('<span>xxx</span>').replace('xxx', expectedSpecialEnder);
    const unescapedHTML = `<span>${expectedSpecialEnder}</span>`;
    const className = 'MY_UNIQUE_CLASS_NAME_FOR_SURE_THERE';

    assert.equal(renderShortnameToString(), null, 'no arguments');
    assert.equal(renderShortnameToString(null), null, 'null');
    assert.equal(renderShortnameToString(''), '', 'empty string');

    assert.equal(renderShortnameToString(emoji.shortname), expectedEmoji, 'returns html for emoji shortname');
    assert.equal(renderShortnameToString(tone.shortname), expectedToned, 'returns html for toned shortname');
    assert.equal(renderShortnameToString(mixed.shortname), expectedMixed, 'returns html for mixed shortname');
    assert.equal(renderShortnameToString(specialSpacer.shortname), expectedSpecialSpacer, 'returns html for 200d shortname');
    assert.equal(renderShortnameToString(specialEnder.shortname), expectedSpecialEnder, 'returns html for fe0f shortname');

    assert.equal(renderShortnameToString(emoji.shortname, { single: true }), expectedEmoji, 'returns html for emoji shortname - single');
    assert.equal(renderShortnameToString(tone.shortname, { single: true }), expectedToned, 'returns html for toned shortname - single');
    assert.equal(renderShortnameToString(mixed.shortname, { single: true }), expectedMixed, 'returns html for mixed shortname - single');
    assert.equal(renderShortnameToString(specialSpacer.shortname, { single: true }), expectedSpecialSpacer, 'returns html for 200d shortname - single');
    assert.equal(renderShortnameToString(specialEnder.shortname, { single: true }), expectedSpecialEnder, 'returns html for fe0f shortname - single');

    assert.equal(renderShortnameToString(shortnameMix), expectedMix, 'shortname mix');
    assert.equal(renderShortnameToString(textShortnameMix), expectedTextMix, 'text shortname mix');

    assert.equal(renderShortnameToString(HTML), escapedHTML, 'escapes HTML');
    assert.equal(renderShortnameToString(HTML, { unsafe: true }), unescapedHTML, 'can be forced to output unsafe content');

    assert.equal(renderShortnameToString(HTML, { className }).includes(className), true, 'includes className');
  });

  it('renderToString', () => {
    const expectedEmoji = `<img src="${imagePath}/64/1f953.png" alt="🥓" draggable="false" data-emoji="1f953" />`;
    const expectedToned = `<img src="${imagePath}/64/1f44d-1f3ff.png" alt="👍🏿" draggable="false" data-emoji="1f44d-1f3ff" />`;
    const expectedMixed = `<img src="${imagePath}/64/1f469-1f469-1f466.png" alt="👩‍👩‍👦" draggable="false" data-emoji="1f469-1f469-1f466" />`;
    const expectedSpecialSpacer = `<img src="${imagePath}/64/1f469-1f3fd-1f680.png" alt="👩🏽‍🚀" draggable="false" data-emoji="1f469-1f3fd-1f680" />`;
    const expectedSpecialEnder = `<img src="${imagePath}/64/1f468-1f3ff-2708.png" alt="👨🏿‍✈️" draggable="false" data-emoji="1f468-1f3ff-2708" />`;

    const unicodeMix = [
      specialEnder.unicode,
      specialSpacer.unicode,
      mixed.unicode,
      tone.unicode,
      emoji.unicode,
    ].join('');

    const textUnicodeMix = `is ${specialSpacer.unicode}${specialEnder.unicode} good ${tone.unicode} k`;

    const expectedMix = [
      expectedSpecialEnder,
      expectedSpecialSpacer,
      expectedMixed,
      expectedToned,
      expectedEmoji,
    ].join('');
    const expectedTextMix = `is ${expectedSpecialSpacer}${expectedSpecialEnder} good ${expectedToned} k`;

    const HTML = `<span>${specialEnder.unicode}</span>`;
    const escapedHTML = escapeHtml('<span>xxx</span>').replace('xxx', expectedSpecialEnder);
    const unescapedHTML = `<span>${expectedSpecialEnder}</span>`;
    const className = 'MY_UNIQUE_CLASS_NAME_FOR_SURE_THERE';

    const simple = '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    assert.equal(renderToString(), null, 'no arguments');
    assert.equal(renderToString(null), null, 'null');
    assert.equal(renderToString(''), '', 'empty string');

    assert.equal(renderToString(emoji.unicode), expectedEmoji, 'returns html for emoji unicode');
    assert.equal(renderToString(tone.unicode), expectedToned, 'returns html for toned unicode');
    assert.equal(renderToString(mixed.unicode), expectedMixed, 'returns html for mixed unicode');
    assert.equal(renderToString(specialSpacer.unicode), expectedSpecialSpacer, 'returns html for 200d unicode');
    assert.equal(renderToString(specialEnder.unicode), expectedSpecialEnder, 'returns html for fe0f unicode');

    assert.equal(renderToString(emoji.unicode, { single: true }), expectedEmoji, 'returns html for emoji unicode');
    assert.equal(renderToString(tone.unicode, { single: true }), expectedToned, 'returns html for toned unicode');
    assert.equal(renderToString(mixed.unicode, { single: true }), expectedMixed, 'returns html for mixed unicode');
    assert.equal(renderToString(specialSpacer.unicode, { single: true }), expectedSpecialSpacer, 'returns html for 200d unicode');
    assert.equal(renderToString(specialEnder.unicode, { single: true }), expectedSpecialEnder, 'returns html for fe0f unicode');

    assert.equal(renderToString(unicodeMix), expectedMix, 'unicode mix');
    assert.equal(renderToString(textUnicodeMix), expectedTextMix, 'text unicode mix');

    assert.equal(renderToString(HTML), escapedHTML, 'escapes HTML');
    assert.equal(renderToString(HTML, { unsafe: true }), unescapedHTML, 'can be forced to output unsafe content');

    assert.equal(renderToString(HTML, { className }).includes(className), true, 'includes className');

    assert.equal(renderToString(simple, { unsafe: true }), simple, 'doesn\'t replace numbers and letters');
  });

  it('renderToArray', () => {
    const renderFn = (id) => `<${id}>`;
    const expectedEmoji = '<1f953>';
    const expectedToned = '<1f44d-1f3ff>';
    const expectedMixed = '<1f469-1f469-1f466>';
    const expectedSpecialSpacer = '<1f469-1f3fd-1f680>';
    const expectedSpecialEnder = '<1f468-1f3ff-2708>';

    const unicodeMix = [
      specialEnder.unicode,
      specialSpacer.unicode,
      mixed.unicode,
      tone.unicode,
      emoji.unicode,
    ].join('');

    const textUnicodeMix = `is ${specialSpacer.unicode}${specialEnder.unicode} good ${tone.unicode} k`;

    const expectedMix = [
      expectedSpecialEnder,
      expectedSpecialSpacer,
      expectedMixed,
      expectedToned,
      expectedEmoji,
    ];
    const expectedTextMix = [
      'is ',
      expectedSpecialSpacer,
      expectedSpecialEnder,
      ' good ',
      expectedToned,
      ' k',
    ];

    const expectedStrippedMix = [
      'is ',
      ' good ',
      ' k',
    ];

    const simple = '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    assert.equal(renderToArray(), null, 'no arguments');
    assert.equal(renderToArray(null), null, 'null');
    assert.deepStrictEqual(renderToArray('', renderFn), [], 'empty string');

    assert.deepStrictEqual(renderToArray(emoji.unicode, renderFn), [expectedEmoji], 'returns data for emoji unicode');
    assert.deepStrictEqual(renderToArray(tone.unicode, renderFn), [expectedToned], 'returns data for toned unicode');
    assert.deepStrictEqual(renderToArray(mixed.unicode, renderFn), [expectedMixed], 'returns data for mixed unicode');
    assert.deepStrictEqual(renderToArray(specialSpacer.unicode, renderFn), [expectedSpecialSpacer], 'returns data for 200d unicode');
    assert.deepStrictEqual(renderToArray(specialEnder.unicode, renderFn), [expectedSpecialEnder], 'returns data for fe0f unicode');

    assert.deepStrictEqual(renderToArray(unicodeMix, renderFn), expectedMix, 'unicode mix');
    assert.deepStrictEqual(renderToArray(textUnicodeMix, renderFn), expectedTextMix, 'text unicode mix');
    assert.deepStrictEqual(renderToArray(textUnicodeMix, () => null), expectedStrippedMix, 'strip away emojis');

    assert.deepStrictEqual(renderToArray(simple, renderFn), [simple], 'doesn\'t replace numbers and letters');
  });

  it('emojiCollection', () => {
    assert.equal(Array.isArray(emojiCollection), true, 'returns correct datatype');
  });

  it('emojiRegex', () => {
    assert.equal(typeof emojiRegex, 'string', 'returns correct datatype');
  });

  it('shortnameRegex', () => {
    assert.equal(typeof shortnameRegex, 'string', 'returns correct datatype');
  });
});
