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

em.name = 'jira';
em.init = (options) => {}
em.start = () => {
  em.emit('open', 'jira');
  const values = [];
  let totalComments = 0;
  // ensure folder exists to avoid exceptions
  mkdirp.sync(path.join(__dirname, `../logs/${em.name}`));
  const logs = fs.readdirSync(path.join(__dirname, `../logs/${em.name}`));
  // consider the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = dayjs().subtract(i, 'day').format('YYYY.MM.DD');
    const logsForDate = logs.filter(l => l.startsWith(date));
    values[i] = 0;
    for (let j = 0; j < logsForDate.length; j++) {
      const liner = new lineByLine(path.join(__dirname, `../logs/${em.name}/${logsForDate[j]}`));
      let line;
      while (line = liner.next()) {
        const lineStr = line.toString('utf8');
        if (!(lineStr.trim())) {
          continue;
        }
        values[i] += 1;
        totalComments++;
      }
    }
  }
  let data = chalk.bold.blueBright('__________Jira__________') + '\n\n';
  data += blueBright('Comments:') + '\n';
  data += green(asciichart.plot(values.reverse(), { height: 20 })) + '\n';
  data += `Total comments for the past 30 days: ${greenBright(totalComments)}. Average comments/day: ${greenBright(totalComments /30)}`;
  em.emit('close', 'jira');
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
