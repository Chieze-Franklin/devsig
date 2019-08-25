const chalk = require('chalk');

const config = require('../services/config');

const { log } = console;

module.exports = function(field, value) {
  try {
    if (field) {
      // set config field
      if (value) {
        config.set(field, value);
        const result = config.get(field);
        log(result);
      }
      // get config field
      else {
        const result = config.get(field);
        log(result);
      }
    } else {
      // get config
      const result = config.get();
      log(result);
    }
  } catch (error) {
    log(chalk.redBright(error.message));
    log(error);
  }
}
