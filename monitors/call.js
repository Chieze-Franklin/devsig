const activeWin = require('active-win');
const cron = require('node-cron');
const emitter = require('events').EventEmitter;
const isCameraOn = require('is-camera-on');

const log = require('../services/log');

let camera = false;
const em = new emitter();
let logger, errLogger;
const appsToLog = [
  'zoom'
];

em.name = 'call';
em.init = (options) => {
  errLogger =  log.getLogger('error');
  logger = log.getLogger('call');
}
em.start = () => {
  em.emit('start', 'call');
  cron.schedule("*/5 * * * * *", async () => {
    try {
      const window = await activeWin();
      if (!window) {
        return;
      }
      if (appsToLog.find(app => window.owner.bundleId.toLowerCase().indexOf(app.toLowerCase()) > -1)) {
        camera = await isCameraOn();
        logger.info({
          camera,
          window
        });
      }
    } catch(error) {
      errLogger.info(error); // errLogger.error(...) throws an exception (can you believe that?)
    }
  });
}

module.exports = em;
