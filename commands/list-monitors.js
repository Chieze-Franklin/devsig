const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const { log } = console;
const { blue, blueBright, green, greenBright, red, redBright, yellow, yellowBright } = chalk;

let monitorFiles;

module.exports = function(monitor, options) {
  try {
    if (!monitorFiles) {
      monitorFiles = fs.readdirSync(path.join(__dirname, '../monitors/'));
    }

    monitorFiles.forEach(file => {
      const name = file.toLowerCase().substring(0, file.length - 3);
      log(yellowBright(`${name}`));
    });
  } catch (error) {
    log(redBright(error.message));
    log(error);
  }
}
