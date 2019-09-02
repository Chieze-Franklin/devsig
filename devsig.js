#!/usr/bin/env node
const chalk = require('chalk');
const pkg = require('./package.json');
const program = require('commander');
const updateNotifier = require('update-notifier');

const { editConfig, getReport, startMonitor } = require('./commands');
const { log } = console;

log(chalk.bold.blueBright(`DevSig Agent`));
log();
const notifier = updateNotifier({pkg, updateCheckInterval: 1000 * 60 * 60 * 24}).notify();
notifier.notify();

process.on('uncaughtException', (error) => {
  log(chalk.redBright(error.message));
  log(error);
});

function commaSeparatedList(value, previous) {
  return value.split(',');
}

program
  .version('1.0.8')
  .description('DevSig Agent');

program
  .command('start [monitor]')
  .option('-a, --apps <apps>', 'list the apps to monitor', commaSeparatedList)
  .option('-k, --key-events <events>', 'list the keyboard events to monitor', commaSeparatedList)
  .option('-m, --mouse-events <events>', 'list the mouse events to monitor', commaSeparatedList)
  .description('Start a monitor or all monitors')
  .action(startMonitor);

program
  .command('report <reporter>')
  .option('--group-by <field>', 'the field or column by which rows are grouped together')
  .option('--logs <logs>', 'list the logs to consider', commaSeparatedList)
  .description('Generate a report')
  .action(getReport);

program
  .command('config [field] [value]')
  .description('Get or set the value of a config field')
  .action(editConfig);

program.parse(process.argv);
  