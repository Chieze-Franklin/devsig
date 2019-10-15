const autostart = require('node-autostart')
const chalk = require('chalk');
const path = require('path');

const { log } = console;
const { blue, blueBright, green, greenBright, red, redBright, yellow, yellowBright } = chalk;

module.exports = function(command) {
  try {
    if (command === 'off') {
      autostart.disableAutostart('devsig', function (error) {
        if(error) {
          throw new Error(error.message);
        }
        log(`Autostart has been turned ${red('off')}`);
      })
    } else if (command === 'on') {
      autostart.enableAutostart('devsig', 'node devsig start', path.join(__dirname, '../'), function (error) {
        if(error) {
          throw new Error(error.message);
        }
        log(`Autostart has been turned ${green('on')}`);
      })
    } else if (command === 'status') {
      autostart.isAutostartEnabled('devsig', function (error, isEnabled) {
        if(error) {
          throw new Error(error.message);
        }
       
        if(isEnabled) {
          log(`Autostart is ${green('on')}`);
        }
        else {
          log(`Autostart is ${red('off')}`);
        }
       
      })
    } else {
      log(redBright(`Unrecognized command '${command}'\nAcceptable values are: 'off', 'on', 'status'`));
    }
  } catch (error) {
    log(redBright(error.message));
    log(error);
  }
}