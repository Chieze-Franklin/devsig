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
let client;

const { blue, blueBright, green, greenBright, red, redBright, yellow, yellowBright } = chalk;
let errLogger;
let opt;

em.name = 'call';
em.init = (options) => {
  errLogger =  log.getLogger('error');
  opt = options || {};
  if (opt.push) {
    client = new Client(config.get('user.email'), config.get('app.token'));
  }
}
em.start = async () => {
  try {
    em.emit('start', 'call');
    const calls = [], cameraOn = [];
    const numOfDays = 5; // number of days to consider
    let numOfResponses = 0; // number of responses from the server
    const expectedNumOfRes = 2 * numOfDays; // expected number of responses from the server
    // ensure folder exists to avoid exceptions
    mkdirp.sync(path.join(__dirname, `../logs/${em.name}`));
    const logs = fs.readdirSync(path.join(__dirname, `../logs/${em.name}`));
    for (let i = (numOfDays - 1); i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY.MM.DD');
      const logsForDate = logs.filter(l => l.startsWith(date));
      calls[i] = 0;
      let currentTitle = '';
      cameraOn[i] = 0;
      let cameraInstancesOn = 0, totalCameraInstances = 0;
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
          if (!json.window || !json.window.title) {
            continue;
          }

          // new call
          if (json.window.title.startsWith('Zoom Meeting ID: ') && json.window.title !== currentTitle) {
            currentTitle = json.window.title;
            calls[i] += 1;
          }

          // camera on
          if (typeof json.camera !== 'undefined') {
            if (json.camera) {
              cameraInstancesOn++;
            }
            totalCameraInstances++;
            cameraOn[i] = (cameraInstancesOn / totalCameraInstances) * 100;
          }
        }
      }
      // push to server
      if (opt.push) {
        client
          .date(dayjs().subtract(i, 'day').toDate())
          .period('day')
          // .send('calls_per_day', calls[i], (error, result) => {
          //   if (result) {
          //     if (result.data) {
          //       console.log('calls_per_day[result.data]:');
          //       console.log(result.data);
          //     } else if (result.error) {
          //       console.log('calls_per_day[result.error]:');
          //       console.log(result.error);
          //     }
          //   } else if (error) {
          //     console.log('calls_per_day[error]:');
          //     console.log(error.message);
          //   }
          // })
          .send('calls_per_day', calls[i], serverResponse)
          .send('cam_on_per_day', cameraOn[i], serverResponse)
      }
    }

    function arraySum(sum, num) {
      return sum + num;
    }
    function serverResponse(error, result) {
      // console.log("error:");console.log(error);
      // console.log("result:");console.log(result);
      numOfResponses++;
      if (numOfResponses >= expectedNumOfRes) {
        em.emit('end', 'call');
      }
    }

    let data = chalk.bold.blueBright('__________Calls__________') + '\n\n';
    data += blueBright('Calls:') + '\n';
    data += green(asciichart.plot(calls.reverse(), { height: 20 })) + '\n';
    const totalCalls = calls.reduce(arraySum);
    data += `Total calls for the past ${numOfDays} days: ${greenBright(totalCalls)}. Average calls/day: ${greenBright(totalCalls /numOfDays)}\n\n`;


    data += blueBright('% times with camera on:') + '\n';
    data += green(asciichart.plot(cameraOn.reverse(), { height: 20 })) + '\n';
    const totalCameraOn = cameraOn.reduce(arraySum);
    data += `% times with camera on/day for the past ${numOfDays} days: ${greenBright(totalCameraOn /numOfDays)}`;
    if (!opt.push) {
      em.emit('end', 'call');
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
    em.emit('end', 'call');
  }
}

module.exports = em;
