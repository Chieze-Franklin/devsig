const emitter = require('events').EventEmitter;
const activeWin = require('active-win');
const cron = require("node-cron");

let appsToLog = [];
let currentApp, currentView;

const em = new emitter();

em.on('data', (window) => {
  console.log(window)
});

em.init = (options) => {
  appsToLog = options.apps || appsToLog;
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
