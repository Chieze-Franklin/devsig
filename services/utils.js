const chalk = require('chalk');
const config = require('./config');

const { log } = console;

function emailIsPresent() {
  if (!config.get('user.email')) {
    log(redBright('Cannot find your email address'));
    log(`Run ${chalk.yellow('devsig config user.email')} ${chalk.bold.yellow('<your-andela-email-address>')}`);
    log();
    return false;
  }
  return true;
}
function appTokenIsPresent() {
  if (!config.get('app.token')) {
    log(redBright('Cannot find app token'));
    log('Reach out to the LearnTech team for an app token')
    log(`Run ${chalk.yellow('devsig config app.token')} ${chalk.bold.yellow('<app-token>')}`);
    log();
    return false;
  }
  return true;
}

module.exports = {
  appTokenIsPresent,
  emailIsPresent
}
