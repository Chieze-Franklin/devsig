const chalk = require('chalk');
const dayjs = require('dayjs');
const fs = require('fs');
const mkdirp = require('mkdirp');
const open = require('open');
const path = require('path');

const { log } = console;
const { blue, blueBright, green, greenBright, red, redBright, yellow, yellowBright } = chalk;

let reporterFiles;
const sessionName = dayjs().format('YYYY.MM.DD-HH.mm.ss.SSS') + '.txt';

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

    let fileHandles = 0;
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
          let { data } = msg;
          if (msg.replace) {
            // the story here:
            // msg.data may contain formating text that should be there when we are logging to the console
            // but removed when writing to file
            // you specify these in msg.replace where each key is the text to remove and its corresponding
            // value is the replace text
            // we use a regular expression with flag /g so every instance of the text is replaced
            // (instead of just the 1st instance)
            // but we must first change '[' to '\\[' so the regex doesn't cry
            const keys = Object.keys(msg.replace);
            keys.forEach(key => data = data.replace(new RegExp(key.replace('[', '\\['), 'g'), msg.replace[key]));
          }
          fs.appendFile(path.join(__dirname, `../reports/${options.file || sessionName}`), data + '\n\n', (error) => {});
          // open the file in default program
          //
          // What's happening here:
          // Multiple reporters could be generating reports to be written to this file
          // I want to ensure the file isn't opened until all reporters are done writing to it
          // To do this we have a variable fileHandles that holds the number of reporters
          // still writing to this file. The number is increased by 1 when the 'open' event is handled
          // and reduced by 1 when the 'close' event is handled.
          // We also wait 1000ms before checking the value of fileHandles to be sure any 'open' or
          // 'close' event that ought to be handled has been handled.
          setTimeout(async ()=>{
            if (fileHandles === 0) {
              await open(path.join(__dirname, `../reports/${options.file || sessionName}`));
              process.exit(); // for some reason I now have to manually call this.. was exiting by itself like 2 minutes aga :confused:
            }
          }, 1000);
        }
      });
      const name = rpt.name || r;
      rpt.on('close', (msg) => fileHandles--);
      rpt.on('open', (msg) => fileHandles++);

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
