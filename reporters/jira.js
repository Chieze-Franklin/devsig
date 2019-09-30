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

em.name = 'jira';
em.init = (options) => {
  errLogger =  log.getLogger('error');
  opt = options || {};
  if (opt.push) {
    client = new Client(config.get('user.email'), config.get('app.token'));
  }
}
em.start = () => {
  try {
    em.emit('start', 'jira');
    const values = [];
    const numOfDays = 5; // number of days to consider
    let numOfResponses = 0; // number of responses from the server
    const expectedNumOfRes = 1 * numOfDays; // expected number of responses from the server
    // ensure folder exists to avoid exceptions
    mkdirp.sync(path.join(__dirname, `../logs/${em.name}`));
    const logs = fs.readdirSync(path.join(__dirname, `../logs/${em.name}`));
    // consider the last ${numOfDays} days
    for (let i = 0; i < numOfDays; i++) {
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
        }
      }
      // push to server
      if (opt.push) {
        client
          .date(dayjs().subtract(i, 'day').toDate())
          .period('day')
          .send('jira_comments_per_day', values[i], serverResponse)
      }
    }

    function arraySum(sum, num) {
      return sum + num;
    }
    function serverResponse(error, result) {
      numOfResponses++;
      if (numOfResponses >= expectedNumOfRes) {
        em.emit('end', 'jira');
      }
    }

    let data = chalk.bold.blueBright('__________Jira__________') + '\n\n';
    data += blueBright('Comments:') + '\n';
    data += green(asciichart.plot(values.reverse(), { height: 20 })) + '\n';
    const totalComments = values.reduce(arraySum);
    data += `Total comments for the past ${numOfDays} days: ${greenBright(totalComments)}. Average comments/day: ${greenBright(totalComments /numOfDays)}`;
    if (!opt.push) {
      em.emit('end', 'jira');
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
    em.emit('close', 'jira');
  }
}

module.exports = em;
