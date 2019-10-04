const asciichart = require ('asciichart');
const chalk = require('chalk');
const dayjs = require('dayjs');
const emitter = require('events').EventEmitter;
const fs = require('fs');
const mkdirp = require('mkdirp');
const lineByLine = require('n-readlines');
const path = require('path');

const { Client } = require('devsig-client');

const config = require('../services/config');
const log = require('../services/log');

const em = new emitter();

const { blue, blueBright, green, greenBright, red, redBright, yellow, yellowBright } = chalk;
let errLogger;
let opt;

em.name = 'slack';
em.init = (options) => {
  errLogger =  log.getLogger('error');
  opt = options || {};
  if (opt.push) {
    client = new Client(config.get('user.email'), config.get('app.token'));
  }
}
em.start = () => {
  try {
    em.emit('start', 'slack');
    const messages = [], unread = [];
    const numOfDays = 15; // number of days to consider
    let numOfResponses = 0; // number of responses from the server
    const expectedNumOfRes = 2 * numOfDays; // expected number of responses from the server
    // ensure folder exists to avoid exceptions
    mkdirp.sync(path.join(__dirname, `../logs/${em.name}`));
    const logs = fs.readdirSync(path.join(__dirname, `../logs/${em.name}`));
    // consider the last ${numOfDays} days
    for (let i = 0; i < numOfDays; i++) {
      const date = dayjs().subtract(i, 'day').format('YYYY.MM.DD');
      const logsForDate = logs.filter(l => l.startsWith(date));
      messages[i] = 0;
      unread[i] = 0;
      let unreadCount = 0;
      for (let j = 0; j < logsForDate.length; j++) {
        const liner = new lineByLine(path.join(__dirname, `../logs/${em.name}/${logsForDate[j]}`));
        let line;
        while (line = liner.next()) {
          const lineStr = line.toString('utf8');
          if (!(lineStr.trim())) {
            continue;
          }
          
          const jsonStr = lineStr.substring(lineStr.indexOf(' INFO  ') + 7, lineStr.lastIndexOf('}') + 1);
          const json = JSON.parse(jsonStr);
          if (!json.workspace || json.workspace.toLowerCase() !== 'andela') {
            continue;
          }
          // messages
          messages[i] += 1;

          // unread
          if (typeof json.unread !== 'undefined') {
            unread[i] += json.unread;
            unreadCount++;
          }
        }
      }
      if (unreadCount > 0) {
        unread[i] = unread[i] / unreadCount;
      }
      // push to server
      if (opt.push) {
        client
          .date(dayjs().subtract(i, 'day').toDate())
          .period('day')
          .send('slack_sent_messages_per_day', messages[i], serverResponse)
          .send('slack_unread_messages_per_day', unread[i], serverResponse)
      }
    }

    function arraySum(sum, num) {
      return sum + num;
    }
    function serverResponse(error, result) {
      numOfResponses++;
      if (numOfResponses >= expectedNumOfRes) {
        em.emit('end', 'slack');
      }
    }

    let data = chalk.bold.blueBright('__________Slack__________') + '\n\n';
    data += blueBright('Messages:') + '\n';
    data += green(asciichart.plot(messages.reverse(), { height: 20 })) + '\n';
    const totalMessages = messages.reduce(arraySum);
    data += `Total messages for the past ${numOfDays} days: ${greenBright(totalMessages)}. Average messages/day: ${greenBright(totalMessages / numOfDays)}\n\n`;


    data += blueBright('Average unread messages:') + '\n';
    data += green(asciichart.plot(unread.reverse(), { height: 20 })) + '\n';
    const totalUnread = unread.reduce(arraySum);
    data += `Average unread messages/day for the past ${numOfDays} days: ${greenBright(totalUnread / numOfDays)}`;
    if (!opt.push) {
      em.emit('end', 'slack');
    }
    em.emit('report', {
      output: opt.push ? 'console' : 'file',
      data,
      replace: {
        '[1m': '',
        '[22m': '',
        '[32m': '',
        '[39m': '',
        '[92m': '',
        '[94m': ''
      }
    });
  } catch (error) {
    errLogger.info(error); // errLogger.error(...) throws an exception (can you believe that?)
    em.emit('end', 'slack');
  }
}

module.exports = em;
