const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

class Reporter {
  constructor(name) {
    this.name = name;
  }
  text(data) {
    fs.writeFile(path.join(__dirname, `../reports/${this.name}/${this.name}.txt`), data, (error) => {});
  }
}

function getReporter(name) {
  // create report directory
  mkdirp.sync(path.join(__dirname, `../reports/${name}`));

  const reporter = new Reporter(name);
  return reporter;
}

module.exports = {
  getReporter
};
