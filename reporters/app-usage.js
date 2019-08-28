const chalk = require('chalk');
const fs = require('fs');
const lineByLine = require('n-readlines');
const path = require('path');
const { createStream } = require('table');

const emitter = require('events').EventEmitter;

const em = new emitter();

let logFiles, logFilesToUse;
let groupBy = 'title';

em.init = (options) => {
  logFilesToUse = options.logs;
  groupBy = options.groupBy || groupBy;
  // -------
  // TODO: throw friendly msg id there is no '../logs/app-usage'
  if (!logFiles) {
    logFiles = fs.readdirSync(path.join(__dirname, '../logs/app-usage'));
    logFiles = logFiles.filter(l => typeof logFilesToUse === 'undefined' ||
      logFilesToUse.map(l => l.toLowerCase()).indexOf(l.toLowerCase()) > -1);
  }
}
em.name = 'app-usage';
em.start = () => {
  
  const options = {
    columnDefault: {
      width: 25
    },
    columnCount: groupBy === 'name' ? 4 :
      groupBy === 'title' ? 5 : 6,
  }
  const stream = createStream(options);
  if (groupBy === 'name') {
    stream.write([
      chalk.bold.greenBright('Name'),
      chalk.bold.greenBright('Connection'),
      chalk.bold.greenBright('From'),
      chalk.bold.greenBright('To')
    ]);
  } else if (groupBy === 'title') {
    stream.write([
      chalk.bold.greenBright('Name'),
      chalk.bold.greenBright('Title'),
      chalk.bold.greenBright('Connection'),
      chalk.bold.greenBright('From'),
      chalk.bold.greenBright('To')
    ]);
  } else if (groupBy === 'event-type') {
    stream.write([
      chalk.bold.greenBright('Name'),
      chalk.bold.greenBright('Title'),
      chalk.bold.greenBright('Event Type'),
      chalk.bold.greenBright('Connection'),
      chalk.bold.greenBright('From'),
      chalk.bold.greenBright('To')
    ]);
  }
  let row = 1, totalConns = 0, positiveConns = 0, lastEntry;
  for (i = 0; i < logFiles.length; i++) {
    const liner = new lineByLine(path.join(__dirname, `../logs/app-usage/${logFiles[i]}`));
    let line;
    while (line = liner.next()) {
      const lineStr = line.toString('utf8');
      if (!(lineStr.trim())) {
        continue;
      }
      const dateStr = lineStr.substring(0, lineStr.indexOf(' '));
      const date = new Date(dateStr);
      const jsonStr = lineStr.substring(lineStr.indexOf(' INFO  ') + 7, lineStr.lastIndexOf('}') + 1);
      const json = JSON.parse(jsonStr);
      if (!lastEntry) {
        lastEntry = {
          name: json.window.owner.name,
          title: json.window.title,
          eventType: json.event.type.startsWith('key') ? 'key' : 'mouse',
          event: json.event.type,
          connection: json.system.network.connected,
          from: date,
          to: date
        };
        totalConns = 1;
        positiveConns = json.system.network.connected ? 1 : 0;
      } else {
        if (groupBy === 'name') {
          if (lastEntry.name === json.window.owner.name &&
          (date.getTime() - lastEntry.to.getTime()) < 30000) {
            lastEntry.to = date;
            totalConns += 1;
            positiveConns += json.system.network.connected ? 1 : 0;
          } else {
            const color = (row % 2) === 0 ? chalk.white : chalk.yellow;
            row++;
            stream.write([
              color(lastEntry.name),
              color(`${(positiveConns / totalConns) * 100}%`),
              color(lastEntry.from),
              color(lastEntry.to)
            ]);
            if ((date.getTime() - lastEntry.to.getTime()) >= 30000) {
              stream.write([
                chalk.bgBlue('          '),
                chalk.bgBlue('          '),
                chalk.bgBlue('          '),
                chalk.bgBlue('          ')
              ]);
            }
            lastEntry = {
              name: json.window.owner.name,
              title: json.window.title,
              eventType: json.event.type.startsWith('key') ? 'key' : 'mouse',
              event: json.event.type,
              connection: json.system.network.connected,
              from: date,
              to: date
            };
            totalConns = 1;
            positiveConns = json.system.network.connected ? 1 : 0;
          }
        } else if (groupBy === 'title') {
          if (lastEntry.name === json.window.owner.name && lastEntry.title === json.window.title &&
          (date.getTime() - lastEntry.to.getTime()) < 30000) {
            lastEntry.to = date;
            totalConns += 1;
            positiveConns += json.system.network.connected ? 1 : 0;
          } else {
            const color = (row % 2) === 0 ? chalk.white : chalk.yellow;
            row++;
            stream.write([
              color(lastEntry.name),
              color(lastEntry.title),
              color(`${(positiveConns / totalConns) * 100}%`),
              color(lastEntry.from),
              color(lastEntry.to)
            ]);
            if ((date.getTime() - lastEntry.to.getTime()) >= 30000) {
              stream.write([
                chalk.bgBlue('          '),
                chalk.bgBlue('          '),
                chalk.bgBlue('          '),
                chalk.bgBlue('          '),
                chalk.bgBlue('          ')
              ]);
            }
            lastEntry = {
              name: json.window.owner.name,
              title: json.window.title,
              eventType: json.event.type.startsWith('key') ? 'key' : 'mouse',
              event: json.event.type,
              connection: json.system.network.connected,
              from: date,
              to: date
            };
            totalConns = 1;
            positiveConns = json.system.network.connected ? 1 : 0;
          }
        } else if (groupBy === 'event-type') {
          if (lastEntry.name === json.window.owner.name && lastEntry.title === json.window.title &&
          lastEntry.eventType.substring(0, 3) === json.event.type.substring(0, 3) &&
          (date.getTime() - lastEntry.to.getTime()) < 30000) {
            lastEntry.to = date;
            totalConns += 1;
            positiveConns += json.system.network.connected ? 1 : 0;
          } else {
            const color = (row % 2) === 0 ? chalk.white : chalk.yellow;
            row++;
            stream.write([
              color(lastEntry.name),
              color(lastEntry.title),
              color(lastEntry.eventType),
              color(`${(positiveConns / totalConns) * 100}%`),
              color(lastEntry.from),
              color(lastEntry.to)
            ]);
            if ((date.getTime() - lastEntry.to.getTime()) >= 30000) {
              stream.write([
                chalk.bgBlue('          '),
                chalk.bgBlue('          '),
                chalk.bgBlue('          '),
                chalk.bgBlue('          '),
                chalk.bgBlue('          '),
                chalk.bgBlue('          ')
              ]);
            }
            lastEntry = {
              name: json.window.owner.name,
              title: json.window.title,
              eventType: json.event.type.startsWith('key') ? 'key' : 'mouse',
              event: json.event.type,
              connection: json.system.network.connected,
              from: date,
              to: date
            };
            totalConns = 1;
            positiveConns = json.system.network.connected ? 1 : 0;
          }
        }
      }
    }
  }
  if (groupBy === 'name') {
    const color = (row % 2) === 0 ? chalk.white : chalk.yellow;
    row++;
    stream.write([
      color(lastEntry.name),
      color(`${(positiveConns / totalConns) * 100}%`),
      color(lastEntry.from),
      color(lastEntry.to)
    ]);
  } else if (groupBy === 'title') {
    const color = (row % 2) === 0 ? chalk.white : chalk.yellow;
    row++;
    stream.write([
      color(lastEntry.name),
      color(lastEntry.title),
      color(`${(positiveConns / totalConns) * 100}%`),
      color(lastEntry.from),
      color(lastEntry.to)
    ]);
  } else {
    const color = (row % 2) === 0 ? chalk.white : chalk.yellow;
    row++;
    stream.write([
      color(lastEntry.name),
      color(lastEntry.title),
      color(lastEntry.eventType),
      color(`${(positiveConns / totalConns) * 100}%`),
      color(lastEntry.from),
      color(lastEntry.to)
    ]);
  }
}

module.exports = em;
