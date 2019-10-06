#!/usr/bin/env node
const chalk = require('chalk');
const pkg = require('./package.json');
const program = require('commander');

const { uptime, verifyUser } = require('./middleware');
const { editConfig, getReport, fix, listMonitors, startMonitor } = require('./commands');
const { log } = console;

log(chalk.bold.blueBright(`DevSig Agent ${pkg.version}`));
log();

process.on('uncaughtException', (error) => {
  log(chalk.redBright(error.message));
  log(error);
});

function commaSeparatedList(value, previous) {
  return value.split(',');
}

program
  .version(pkg.version)
  .description('DevSig Agent');

program
  .command('start [monitor]')
  .option('-a, --apps <apps>', 'list the apps to monitor', commaSeparatedList)
  .option('-k, --key-events <events>', 'list the keyboard events to monitor', commaSeparatedList)
  .option('-m, --mouse-events <events>', 'list the mouse events to monitor', commaSeparatedList)
  .description('Start a monitor or all monitors')
  .action(verifyUser)
  .action(uptime)
  .action(startMonitor);

program
  .command('list')
  .action(listMonitors);

program
  .command('report [reporter]')
  .option('-f, --file <name>', 'the name of the file to which the report is to be written')
  .option('--logs <logs>', 'list the logs to consider', commaSeparatedList)
  .option('--push', 'push the report to the server')
  .description('Generate a report')
  .action(verifyUser)
  .action(getReport);

program
  .command('config [field] [value]')
  .description('Get or set the value of a config field')
  .action(editConfig);

program
  .command('fix')
  .description('Fixes issues like "Cannot find module \'iohook\'"')
  .action(fix);

program.parse(process.argv);
  