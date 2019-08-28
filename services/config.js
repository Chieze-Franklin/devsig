const fs = require('fs')
const path = require('path');

const defaultConfig = {
  monitor: {
    apps: [ 'chrome', 'firefox', 'slack', 'vscode', 'zoom' ],
    keyEvents: [ 'keydown', 'keyup' ],
    mouseEvents: [ 'mousedown', 'mouseclick', 'mousedrag' ]
  }
}

function getSetUserConfig(config) {
  const filepath = path.join(__dirname, '../.config.json');
  if (!fs.existsSync(filepath) || config) {
    var jsonContent = JSON.stringify(config || defaultConfig);
    fs.writeFileSync(filepath, jsonContent, 'utf8');
  }
  const userConfig = require(filepath);
  return userConfig;
}

// ------
function get(field) {
  const userConfig = getSetUserConfig();

  if (!field) {
    return userConfig;
  }

  const fields = field.split('.').filter(f => !!f);
  let reducedConfig = userConfig;
  for (i = 0; i < fields.length; i++) {
    const f = fields[i];
    reducedConfig = reducedConfig[f];
    if (!reducedConfig) {
      break;
    }
  }
  return reducedConfig;
}
function set(field, value) {
  const userConfig = getSetUserConfig();

  if (value.indexOf(',') > -1) {
    value = value.split(',').filter(v => !!v);
  }

  // not the best way but
  const fields = field.split('.').filter(f => !!f);
  if (fields.length === 2 && fields[0] === 'monitor') {
    userConfig.monitor[fields[1]] = value;
  }

  getSetUserConfig(userConfig);
}

module.exports = {
  get,
  set
}
