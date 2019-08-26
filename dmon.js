#!/usr/bin/env node
const chalk = require('chalk');
const program = require('commander');

const { editConfig, getReport, startMonitor } = require('./commands');
const { getAndVerifyEmail } = require('./middleware');

process.on('uncaughtException', (error) => {
  console.log(chalk.redBright(error.message));
  console.log(error);
});

function commaSeparatedList(value, previous) {
  return value.split(',');
}

program
  .version('0.0.1')
  .description('DMon Agent');

program
  .command('start [monitor]')
  .option('-a, --apps <apps>', 'list the apps to monitor', commaSeparatedList)
  .option('-k, --key-events <events>', 'list the keyboard events to monitor', commaSeparatedList)
  .option('-m, --mouse-events <events>', 'list the mouse events to monitor', commaSeparatedList)
  .description('Start a monitor or all monitors')
  //.action(getAndVerifyEmail)
  .action(startMonitor);

program
  .command('report <reporter>')
  .description('Generate a report')
  .action(getReport);

program
  .command('config [field] [value]')
  .description('Get or set the value of a config field')
  .action(editConfig);

program.parse(process.argv);
  