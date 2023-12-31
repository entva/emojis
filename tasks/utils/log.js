const { bold } = require('kleur');

const utils = {
  formatMessage(payload) {
    if (typeof payload === 'string') return payload;
    return JSON.stringify(payload, null, 2);
  },

  logSuccess(message) {
    console.log(bold().green(utils.formatMessage(message)));
    process.exit(0);
  },

  logResult(message) {
    console.log(utils.formatMessage(message));
    process.exit(0);
  },

  logError(message) {
    console.error(bold().red(utils.formatMessage(message)));
    process.exit(1);
  },
};

module.exports = utils;
