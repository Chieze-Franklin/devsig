const Conf = require('conf');

const defaults = {
  monitor: {
    apps: [ 'chrome', 'firefox', 'slack', 'vscode', 'zoom' ],
    keyEvents: [ 'keydown', 'keyup' ],
    mouseEvents: [ 'mousedown', 'mouseclick', 'mousedrag' ]
  }
}

const config = new Conf({
  defaults
});

// ------
function get(field) {
  if (!field) {
    return config.store;
  }

  return config.get(field);
}
function set(field, value) {
  if (value.indexOf(',') > -1) {
    value = value.split(',').filter(v => !!v);
  }

  config.set(field, value);
}

module.exports = {
  get,
  set
}
