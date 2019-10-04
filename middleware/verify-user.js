const { emailIsPresent, appTokenIsPresent } = require('../services/utils');

module.exports = async function() {
  if (!emailIsPresent() || !appTokenIsPresent()) {
    process.exit();
  }
}