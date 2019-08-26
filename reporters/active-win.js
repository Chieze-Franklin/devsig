const chalk = require('chalk');
const fs = require('fs');
const lineByLine = require('n-readlines');
const path = require('path');
const { createStream } = require('table');

const emitter = require('events').EventEmitter;

const em = new emitter();

let logFiles;
let groupBy = 'name';

em.init = (options) => {
  //
}
em.name = 'active-win';
em.start = () => {
  // TODO: throw friendly msg id there is no '../logs/active-win'
  if (!logFiles) {
    logFiles = fs.readdirSync(path.join(__dirname, '../logs/active-win'));
  }
  const options = {
    columnDefault: {
      width: 40
    },
    columnCount: groupBy === 'name' ? 3 : 4,
  }
  const stream = createStream(options);
  if (groupBy === 'name') {
    stream.write([
      chalk.bold.greenBright('Name'),
      chalk.bold.greenBright('From'),
      chalk.bold.greenBright('To')
    ]);
  } else {
    stream.write([
      chalk.bold.greenBright('Name'),
      chalk.bold.greenBright('Title'),
      chalk.bold.greenBright('From'),
      chalk.bold.greenBright('To')
    ]);
  }
  let row = 1, lastEntry;
  for (i = 0; i < logFiles.length; i++) {
    const liner = new lineByLine(path.join(__dirname, `../logs/active-win/${logFiles[i]}`));
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
          name: json.owner.name,
          title: json.title,
          from: date,
          to: date
        };
      } else {
        if (groupBy === 'name') {
          if (lastEntry.name === json.owner.name &&
          (date.getTime() - lastEntry.to.getTime()) < 30000) {
            lastEntry.to = date;
          } else {
            const color = (row % 2) === 0 ? chalk.white : chalk.yellow;
            row++;
            stream.write([
              color(lastEntry.name),
              color(lastEntry.from),
              color(lastEntry.to)
            ]);
            if ((date.getTime() - lastEntry.to.getTime()) >= 30000) {
              stream.write([
                chalk.bgBlue('          '),
                chalk.bgBlue('          '),
                chalk.bgBlue('          ')
              ]);
            }
            lastEntry = {
              name: json.owner.name,
              title: json.title,
              from: date,
              to: date
            };
          }
        } else {
          if (lastEntry.name === json.owner.name && lastEntry.title === json.title &&
          (date.getTime() - lastEntry.to.getTime()) < 30000) {
            lastEntry.to = date;
          } else {
            const color = (row % 2) === 0 ? chalk.white : chalk.yellow;
            row++;
            stream.write([
              color(lastEntry.name),
              color(lastEntry.title),
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
              name: json.owner.name,
              title: json.title,
              from: date,
              to: date
            };
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
      color(lastEntry.from),
      color(lastEntry.to)
    ]);
  } else {
    const color = (row % 2) === 0 ? chalk.white : chalk.yellow;
    row++;
    stream.write([
      color(lastEntry.name),
      color(lastEntry.title),
      color(lastEntry.from),
      color(lastEntry.to)
    ]);
  }

  // em.emit('report', {
  //   type: 'console',
  //   data: [
  //     ['0A', '0B', '0C'],
  //     ['1A', '1B', '1C'],
  //     ['2A', '2B', '2C']
  //   ],
  //   options: {
  //     columns: {
  //       0: {
  //         alignment: 'left',
  //         width: 10
  //       },
  //       1: {
  //         alignment: 'center',
  //         width: 10
  //       },
  //       2: {
  //         alignment: 'right',
  //         width: 10
  //       }
  //     }
  //   }
  // });
}

module.exports = em;
