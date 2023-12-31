const pkg = require('../../package.json');

const version = pkg.devDependencies['emoji-assets'].replace(/\^/g, '');

const utils = {
  getVersion() {
    return version;
  },
};

module.exports = utils;
