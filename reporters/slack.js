const emitter = require('events').EventEmitter;

const report = require('../services/report');

const em = new emitter();
let reporter;

em.name = 'slack';
em.init = (options) => {
  reporter = report.getReporter('slack');
}
em.start = () => {
  reporter.text('16 messages per day')
}

module.exports = em;
