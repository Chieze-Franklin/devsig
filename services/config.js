const Conf = require('conf');

const defaults = {
  monitors: {
    exclude: []
  },
  reporters: {
    exclude: []
  },
  user: {
    email: ''
  },
  manager: {
    email: ''
  }
}

const config = new Conf({
  defaults,
  projectName: 'devsig'
});

// ------
function get(field) {
  if (config.store.monitor) { // remove deprecated field
    config.store = { ...config.store, monitor: undefined }
  }
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
