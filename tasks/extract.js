const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const emojis = require('emoji-assets/emoji');
const { logResult } = require('./utils/log');
const { getVersion } = require('./utils/assets');

const OUTPUT = path.resolve(`${__dirname}/../.tmp`);

mkdirp.sync(OUTPUT);

const DEFAULT_FILENAME = `raw-emoji-${getVersion()}.json`;
const content = JSON.stringify(emojis, null, 2);

const run = (fileName = DEFAULT_FILENAME) => {
  const target = path.resolve(`${OUTPUT}/${fileName}`);
  fs.writeFileSync(target, content);
  logResult(`Saved results to: ${target}`);
};

module.exports = run;
