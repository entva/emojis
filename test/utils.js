const assert = require('node:assert/strict');

const {
  codepointsHash,
  shortnamesHash,

  unicodeToEmoji,
  shortnameToEmoji,
  shortnameToUnicode,
  unicodeToShortname,

  sanitize,
  getOptions,
  getImageSrc,

  hexToImage,
} = require('../lib/utils');

const { emoji, tone, mixed, specialSpacer, specialEnder, arrow } = require('../scaffolding/emojis');

const assertObject = (obj, ...args) => assert.equal(typeof obj, 'object', ...args);


describe('utils', () => {
  it('codepointsHash', () => {
    assertObject(codepointsHash, 'correct data type');
    assertObject(codepointsHash[emoji.hex], 'data integrity ok');
  });

  it('shortnamesHash', () => {
    assertObject(shortnamesHash, 'correct data type');
    assertObject(shortnamesHash[emoji.shortname], 'data integrity ok');
  });

  it('unicodeToEmoji', () => {
    assertObject(unicodeToEmoji(emoji.unicode), 'simple emoji');
    assertObject(unicodeToEmoji(tone.unicode), 'toned emoji');
    assertObject(unicodeToEmoji(mixed.unicode), 'wwb emoji');
    assertObject(unicodeToEmoji(specialSpacer.unicode), 'emoji with 200d');
    assertObject(unicodeToEmoji(specialEnder.unicode), 'emoji with fe0f');
    assertObject(unicodeToEmoji(arrow.unicode), 'emoji with fe0f ending missing');
  });

  it('shortnameToEmoji', () => {
    assertObject(shortnameToEmoji(emoji.shortname), 'simple emoji');
    assertObject(shortnameToEmoji(tone.shortname), 'toned emoji');
    assertObject(shortnameToEmoji(mixed.shortname), 'wwb emoji');
    assertObject(shortnameToEmoji(specialSpacer.shortname), 'emoji with 200d');
    assertObject(shortnameToEmoji(specialEnder.shortname), 'emoji with fe0f');
  });

  it('shortnameToUnicode', () => {
    assert.equal(shortnameToUnicode(emoji.shortname), emoji.unicode, 'simple emoji');
    assert.equal(shortnameToUnicode(tone.shortname), tone.unicode, 'toned emoji');
    assert.equal(shortnameToUnicode(mixed.shortname), mixed.unicode, 'wwb emoji');
    assert.equal(shortnameToUnicode(specialSpacer.shortname), specialSpacer.unicode, 'emoji with 200d');
    assert.equal(shortnameToUnicode(specialEnder.shortname), specialEnder.unicode, 'emoji with fe0f');
  });

  it('unicodeToShortname', () => {
    assert.equal(unicodeToShortname(emoji.unicode), emoji.shortname, 'simple emoji');
    assert.equal(unicodeToShortname(tone.unicode), tone.shortname, 'toned emoji');
    assert.equal(unicodeToShortname(mixed.unicode), mixed.shortname, 'wwb emoji');
    assert.equal(unicodeToShortname(specialSpacer.unicode), specialSpacer.shortname, 'emoji with 200d');
    assert.equal(unicodeToShortname(specialEnder.unicode), specialEnder.shortname, 'emoji with fe0f');
  });

  it('sanitize', () => {
    assert.equal(sanitize('<script>'), '&lt;script&gt;', 'defaults');
    assert.equal(sanitize('<script>', { unsafe: true }), '<script>', 'not escaped');
  });

  it('getOptions', () => {
    assertObject(getOptions(), '&lt;script&gt;', 'returns correct data type');
    assert.equal(getOptions({ className: 'bruv' }).className, 'bruv', 'overrides work');
    assert.equal(typeof getOptions().size, 'number', 'has sane defaults');
  });

  it('getImageSrc', () => {
    assert.equal(getImageSrc(emoji.icon).includes(`${emoji.icon}.png`), true, 'simple emoji');
    assert.equal(getImageSrc(emoji.icon, 128).includes(`/128/${emoji.icon}.png`), true, 'can set size');
    assert.equal(getImageSrc(emoji.icon, 999999).includes(`/64/${emoji.icon}.png`), true, 'only whitelisted sizes work');
    assert.equal(getImageSrc(emoji.icon, 'http://maxcdn.com/1024').includes(`http://maxcdn.com/1024/${emoji.icon}.png`), true, 'setting CDN works');
  });

  it('hexToImage', () => {
    assert.equal(hexToImage(emoji.hex).includes(emoji.icon), true, 'renders correct emoji');
    assert.equal(hexToImage(specialEnder.hex).includes(specialEnder.icon), true, 'renders correct specialEnder');
    assert.equal(hexToImage(specialEnder.hex, { className: 'bruv' }).includes('class="bruv"'), true, 'options work');
    assert.match(hexToImage(emoji.hex), /^<img/, 'correct tag');
  });
});
