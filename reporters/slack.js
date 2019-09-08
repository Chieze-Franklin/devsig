const emitter = require('events').EventEmitter;

const em = new emitter();

em.name = 'slack';
em.init = (options) => {}
em.start = () => {
  let data = '__________Slack__________\n';
  em.emit('report', {
    output: 'file',
    data: 'slack:\n16 messages per day\naverage of 14 unread messages'
  });
}

module.exports = em;
