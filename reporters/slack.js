const asciichart = require ('asciichart');
const chalk = require('chalk');
const dayjs = require('dayjs');
const emitter = require('events').EventEmitter;
const fs = require('fs');
const mkdirp = require('mkdirp');
const lineByLine = require('n-readlines');
const path = require('path');

const em = new emitter();

const { blue, blueBright, green, greenBright, red, redBright, yellow, yellowBright } = chalk;

em.name = 'slack';
em.init = (options) => {}
em.start = () => {
  em.emit('open', 'slack');
  const messages = [], unread = [];
  let totalMessages = 0, totalUnread = 0;
  // ensure folder exists to avoid exceptions
  mkdirp.sync(path.join(__dirname, `../logs/${em.name}`));
  const logs = fs.readdirSync(path.join(__dirname, `../logs/${em.name}`));
  // consider the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = dayjs().subtract(i, 'day').format('YYYY.MM.DD');
    const logsForDate = logs.filter(l => l.startsWith(date));
    messages[i] = 0;
    unread[i] = 0;
    for (let j = 0; j < logsForDate.length; j++) {
      const liner = new lineByLine(path.join(__dirname, `../logs/${em.name}/${logsForDate[j]}`));
      let line;
      while (line = liner.next()) {
        const lineStr = line.toString('utf8');
        if (!(lineStr.trim())) {
          continue;
        }
        // messages
        messages[i] += 1;
        totalMessages++;

        // unread
        const jsonStr = lineStr.substring(lineStr.indexOf(' INFO  ') + 7, lineStr.lastIndexOf('}') + 1);
        const json = JSON.parse(jsonStr);
        if (json.unread) {
          unread[i] += json.unread;
          totalUnread += json.unread;
        }
      }
    }
  }
  let data = chalk.bold.blueBright('__________Slack__________') + '\n\n';
  data += blueBright('Messages per day:') + '\n';
  data += green(asciichart.plot(messages.reverse(), { height: 20 })) + '\n';
  data += `Total messages for the past 30 days: ${greenBright(totalMessages)}. Average message/day: ${greenBright(totalMessages /30)}\n\n`;


  data += blueBright('Unread messages per day:') + '\n';
  data += green(asciichart.plot(unread.reverse(), { height: 20 })) + '\n';
  data += `Total unread messages for the past 30 days: ${greenBright(totalUnread)}. Average unread message/day: ${greenBright(totalUnread /30)}`;
  em.emit('close', 'slack');
  em.emit('report', {
    output: 'file',
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
}

module.exports = em;
