const { exec } = require('child_process');
const path = require('path');

module.exports = function() {
  try {
    // fix Cannot find module 'iohook'
    exec('npm run postinstall', {
        cwd: path.join(__dirname, '../')
      },
      (error) => {});
  } catch (error) {
    log(redBright(error.message));
    log(error);
  }
}
