const mkdirp = require('mkdirp');
const log = require('simple-node-logger');
const path = require('path');

function getLogger(name) {
  // create log directory
  mkdirp.sync(path.join(__dirname, `../logs/${name}`));

  // create logger
  const opts = {
    errorEventName: 'error',
    logDirectory: path.join(__dirname, `../logs/${name}`),
    fileNamePattern: '<DATE>.log',
    dateFormat: 'YYYY.MM.DD-HH',
    timestampFormat:'YYYY-MM-DDTHH:mm:ss.SSS'
  };
  const logger = log.createRollingFileLogger(opts);
  return logger;
}

module.exports = {
  getLogger
};
