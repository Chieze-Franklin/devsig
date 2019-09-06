const emitter = require('events').EventEmitter;

const report = require('../services/report');

const em = new emitter();
let reporter;

em.name = 'jira';
em.init = (options) => {
  reporter = report.getReporter('jira');
}
em.start = () => {
  reporter.text('8 comments per day')
}

module.exports = em;
