const chalk = require('chalk');
const dayjs = require('dayjs');
const fs = require('fs');
const mkdirp = require('mkdirp');
const open = require('open');
const path = require('path');

const { log } = console;
const { blue, blueBright, green, greenBright, red, redBright, yellow, yellowBright } = chalk;

let reporterFiles;
const sessionName = dayjs().format('YYYY-MM-DDTHH-mm-ss.SSS-A') + '.txt';

module.exports = function(reporter, options) {
  try {
    if (!reporterFiles) {
      reporterFiles = fs.readdirSync(path.join(__dirname, '../reporters/'));
    }

    // get reporters to run
    const reportersFileToRun = reporterFiles
      .filter(file => typeof reporter === 'undefined' ||
      file.toLowerCase() === reporter.toLowerCase() ||
      file.toLowerCase() === reporter.toLowerCase() + '.js');

    if (reportersFileToRun.length === 0) {
      throw new Error(`Cannot find reporter '${reporter}'`);
    }

    reportersFileToRun.forEach(r => {
      const rpt = require(`../reporters/${r}`);
      rpt.on('report', (msg) => {
        if (msg.output === 'console') {
          log(msg.data);
          log();
        } else if (msg.output === 'browser') {
          log(`Go to ${blueBright(msg.data)}`);
          log();
          // open the url in default program
          open(msg.data);
        } else if (msg.output === 'file') {
          log(msg.data);
          log();
          // create report directory
          mkdirp.sync(path.join(__dirname, `../reports`));
          fs.appendFile(path.join(__dirname, `../reports/${options.file || sessionName}`), msg.data + '\n', (error) => {});
          // open the file in default program
          open(path.join(__dirname, `../reports/${options.file || sessionName}`));
        }
      });
      const name = rpt.name || r;
      rpt.on('error', (msg) => log(redBright(`[${name}] ${msg}`)));
      rpt.on('failure', (msg) => log(redBright(`[${name}] ${msg}`)));
      rpt.on('info', (msg) => log(blueBright(`[${name}] ${msg}`)));
      rpt.on('start', (msg) => log(`started monitor: ${yellow(name)}`));
      rpt.on('success', (msg) => log(greenBright(`[${name}] ${msg}`)));
      rpt.on('warning', (msg) => log(yellowBright(`[${name}] ${msg}`)));
      rpt.init(options);
      rpt.start();
    });
  } catch (error) {
    log(redBright(error.message));
    log(error);
  }
}
