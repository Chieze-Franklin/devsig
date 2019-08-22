const emitter = require('events').EventEmitter;
const activeWin = require('active-win');
const cron = require('node-cron');

const log = require('../services/log');

let appsToLog = [];
let currentApp, currentView;
let logger;

const em = new emitter();

em.on('app_changed', (window) => {
  em.emit('info', `current app changed to ${window.owner.name}`);
});
em.on('data', (window) => {
  logger.info(window);
});

em.init = (options) => {
  appsToLog = options.apps || appsToLog;
  logger = log.getLogger('active-win');
}
em.name = 'active-win';
em.start = () => {
  cron.schedule("*/5 * * * * *", async () => {
    const window = await activeWin();
    if (appsToLog.find(app => window.owner.bundleId.toLowerCase().indexOf(app.toLowerCase()) > -1)) {
      em.emit('data', window);
      if (currentApp !== window.owner.path) {
        currentApp = window.owner.path;
        em.emit('app_changed', window);
      }
      if (currentView !== window.title) {
        currentView = window.title;
        em.emit('view_changed', window);
      }
    }
  });
}

module.exports = em;
