const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const { log } = console;
const { blue, blueBright, green, greenBright, red, redBright, yellow, yellowBright } = chalk;

let serviceFiles = [];

module.exports = function(service, options) {
  try {
    log(chalk.bold.blueBright(`LearnTech Agent`));
    log();

    if (serviceFiles.length === 0) {
      serviceFiles = fs.readdirSync(path.join(__dirname, '../services/'));
    }

    // get services to run
    const serviceFilesToRun = serviceFiles
      .filter(file => typeof service === 'undefined' ||
      file.toLowerCase() === service.toLowerCase() ||
      file.toLowerCase() === service.toLowerCase() + '.js');

    if (serviceFilesToRun.length === 0) {
      throw new Error(`Cannot find service '${service}'`);
    }

    serviceFilesToRun.forEach(s => {
      const svc = require(`../services/${s}`);
      svc.init(options);
      svc.start();
      const name = svc.name || s;
      log(`started service: ${yellow(name)}`);
      svc.on('error', (msg) => log(redBright(`${name}: ${msg}`)));
      svc.on('failure', (msg) => log(redBright(`${name}: ${msg}`)));
      svc.on('info', (msg) => log(blueBright(`${name}: ${msg}`)));
      svc.on('success', (msg) => log(greenBright(`${name}: ${msg}`)));
      svc.on('warning', (msg) => log(yellowBright(`${name}: ${msg}`)));
    });
  } catch (error) {
    log(redBright(error.message));
    log(error);
  }
}
