const emitter = require('events').EventEmitter;

const em = new emitter();

em.name = 'jira';
em.init = (options) => {}
em.start = () => {
  em.emit('report', {
    output: 'file',
    data: 'jira:\n8 comments per day'
  });
}

module.exports = em;
