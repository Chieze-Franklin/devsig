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

em.name = 'network';
em.init = (options) => {
  errLogger =  log.getLogger('error');
  opt = options || {};
  if (opt.push) {
    client = new Client(config.get('user.email'), config.get('app.token'));
  }
}
em.start = () => {
  try {
    em.emit('start', 'network');
    const downSpeed = [], upSpeed = [];
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
      downSpeed[i] = 0;
      upSpeed[i] = 0;
      let speedCount = 0;
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
          if (!json.connected) {
            continue;
          }
          downSpeed[i] += json.downSpeed;
          upSpeed[i] += json.upSpeed;
          speedCount++;
        }
      }
      if (speedCount > 0) {
        downSpeed[i] = downSpeed[i] / speedCount;
        upSpeed[i] = upSpeed[i] / speedCount;
      }
      // push to server
      if (opt.push) {
        client
          .date(dayjs().subtract(i, 'day').toDate())
          .period('day')
          .send('network_download_speed_per_day', downSpeed[i], serverResponse)
          .send('network_upload_speed_per_day', upSpeed[i], serverResponse)
      }
    }

    function arraySum(sum, num) {
      return sum + num;
    }
    function serverResponse(error, result) {
      numOfResponses++;
      if (numOfResponses >= expectedNumOfRes) {
        em.emit('end', 'network');
      }
    }

    let data = chalk.bold.blueBright('__________Network__________') + '\n\n';
    data += blueBright('Download Speed (Mb/s):') + '\n';
    data += green(asciichart.plot(downSpeed.reverse(), { height: 20 })) + '\n';
    const totalDownSpeed = downSpeed.reduce(arraySum);
    data += `Average download speed/day for the past ${numOfDays} days: ${greenBright(totalDownSpeed / numOfDays)}\n\n`;


    data += blueBright('Upload Speed (Mb/s)::') + '\n';
    data += green(asciichart.plot(upSpeed.reverse(), { height: 20 })) + '\n';
    const totalUpSpeed = upSpeed.reduce(arraySum);
    data += `Average upload speed/day for the past ${numOfDays} days: ${greenBright(totalUpSpeed / numOfDays)}`;
    if (!opt.push) {
      em.emit('end', 'network');
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
    em.emit('end', 'network');
  }
}

module.exports = em;
