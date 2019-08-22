#!/usr/bin/env node
const chalk = require('chalk');

process.on('uncaughtException', (error) => {
  console.log(chalk.redBright(error.message));
  console.log(error);
});

const program = require('commander');

const { startService } = require('./commands');
const { getAndVerifyEmail } = require('./middleware');

function commaSeparatedList(value, previous) {
  return value.split(',');
}

program
  .version('0.0.1')
  .description('LearnTech Agent');

program
  .command('start [service]')
  .option('-a, --apps <apps>', 'list the apps to monitor', commaSeparatedList)
  .option('-k, --key-events <events>', 'list the keyboard events to monitor', commaSeparatedList)
  .option('-m, --mouse-events <events>', 'list the mouse events to monitor', commaSeparatedList)
  .description('Start a service or all services')
  //.action(getAndVerifyEmail)
  .action(startService);

program.parse(process.argv);
  