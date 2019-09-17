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
  try {
    if (config.store.monitor) { // remove deprecated field
      config.store = { ...config.store, monitor: undefined }
    }
    if (!field) {
      return config.store;
    }
  
    return config.get(field);
  } catch (error) {}
}
function set(field, value) {
  try {
    if (value.indexOf(',') > -1) {
      value = value.split(',').filter(v => !!v);
    }
  
    config.set(field, value);
  } catch (error) {}
}

module.exports = {
  get,
  set
}
