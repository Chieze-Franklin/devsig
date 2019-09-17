const asciichart = require ('asciichart');
const chalk = require('chalk');
const dayjs = require('dayjs');
const emitter = require('events').EventEmitter;
const fs = require('fs');
const mkdirp = require('mkdirp');
const lineByLine = require('n-readlines');
const path = require('path');

const log = require('../services/log');

const em = new emitter();

const { blue, blueBright, green, greenBright, red, redBright, yellow, yellowBright } = chalk;
let errLogger;

em.name = 'call';
em.init = (options) => {
  errLogger =  log.getLogger('error');
}
em.start = () => {
  try {
    em.emit('open', 'call');
    const calls = [], cameraOn = [];
    // ensure folder exists to avoid exceptions
    mkdirp.sync(path.join(__dirname, `../logs/${em.name}`));
    const logs = fs.readdirSync(path.join(__dirname, `../logs/${em.name}`));
    // consider the last 30 days
    for (let i = 29; i >= 0; i--) {
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
    }

    function arraySum(sum, num) {
      return sum + num;
    }

    let data = chalk.bold.blueBright('__________Calls__________') + '\n\n';
    data += blueBright('Calls:') + '\n';
    data += green(asciichart.plot(calls.reverse(), { height: 20 })) + '\n';
    const totalCalls = calls.reduce(arraySum);
    data += `Total calls for the past 30 days: ${greenBright(totalCalls)}. Average calls/day: ${greenBright(totalCalls /30)}\n\n`;


    data += blueBright('% times with camera on:') + '\n';
    data += green(asciichart.plot(cameraOn.reverse(), { height: 20 })) + '\n';
    const totalCameraOn = cameraOn.reduce(arraySum);
    data += `% times with camera on/day for the past 30 days: ${greenBright(totalCameraOn /30)}`;
    em.emit('close', 'call');
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
  } catch (error) {
    errLogger.error(error);
  }
}

module.exports = em;
