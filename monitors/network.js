const cron = require('node-cron');
const emitter = require('events').EventEmitter;
const isOnline = require('is-online');
const speedTest = require('speedtest-net');

const log = require('../services/log');

let connected = false;
const em = new emitter();
let logger, errLogger;

em.name = 'network';
em.init = (options) => {
  errLogger =  log.getLogger('error');
  logger = log.getLogger('network');
}
em.start = () => {
  em.emit('start', 'network');
  cron.schedule("* * * * *", async () => {
    try {
      connected = await isOnline();
      if (connected) {
        const test = speedTest({maxTime: 5000});
        test.on('data', data => {
          logger.info({
            connected,
            downSpeed: data.speeds.download,
            upSpeed: data.speeds.upload
          })
        });
        test.on('error', err => {
          // console.error(err);
        });
      } else {
        logger.info({
          connected,
          downSpeed: 0,
          upSpeed: 0
        })
      }
    } catch (error) {
      errLogger.error(error);
    }
  });
}

module.exports = em;
