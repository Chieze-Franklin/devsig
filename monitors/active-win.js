const emitter = require('events').EventEmitter;
const activeWin = require('active-win');
const cron = require('node-cron');

const config = require('../services/config');
const log = require('../services/log');

let appsToLog;
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
  appsToLog = options.apps || config.get('monitor.apps') || [];
  logger = log.getLogger('active-win');
}
em.name = 'active-win';
em.start = () => {
  em.emit('start', 'active-win');
  cron.schedule("*/5 * * * * *", async () => {
    const window = await activeWin();
    if (!window) {
      return;
    }
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
