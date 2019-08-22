const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const { log } = console;
const { blue, blueBright, green, greenBright, red, redBright, yellow, yellowBright } = chalk;

let monitorFiles = [];

module.exports = function(monitor, options) {
  try {
    log(chalk.bold.blueBright(`DMon Agent`));
    log();

    if (monitorFiles.length === 0) {
      monitorFiles = fs.readdirSync(path.join(__dirname, '../monitors/'));
    }

    // get monitors to run
    const monitorFilesToRun = monitorFiles
      .filter(file => typeof monitor === 'undefined' ||
      file.toLowerCase() === monitor.toLowerCase() ||
      file.toLowerCase() === monitor.toLowerCase() + '.js');

    if (monitorFilesToRun.length === 0) {
      throw new Error(`Cannot find monitor '${monitor}'`);
    }

    monitorFilesToRun.forEach(m => {
      const mtr = require(`../monitors/${m}`);
      mtr.init(options);
      mtr.start();
      const name = mtr.name || m;
      log(`started monitor: ${yellow(name)}`);
      // mtr.on('data', (msg) => log(blueBright(`${name}: ${msg}`)));
      mtr.on('error', (msg) => log(redBright(`${name}: ${msg}`)));
      mtr.on('failure', (msg) => log(redBright(`${name}: ${msg}`)));
      mtr.on('info', (msg) => log(blueBright(`${name}: ${msg}`)));
      mtr.on('success', (msg) => log(greenBright(`${name}: ${msg}`)));
      mtr.on('warning', (msg) => log(yellowBright(`${name}: ${msg}`)));
    });
  } catch (error) {
    log(redBright(error.message));
    log(error);
  }
}
