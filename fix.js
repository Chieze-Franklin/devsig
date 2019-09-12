const fs = require('fs-extra');
const path = require('path');
var rimraf = require("rimraf");

try {
  const runtime = process.versions['electron'] ? 'electron' : 'node';
  const essential = runtime + '-v' + process.versions.modules + '-' + process.platform + '-' + process.arch;

  // copy the iohook folder from local_modules to node_modules
  console.log('installing iohook from local_modules...');
  // delete existing folder to avoid issues
  rimraf.sync(path.join(__dirname, 'node_modules/iohook'));
  // copy iohook
  fs.copySync(path.join(__dirname, 'local_modules/iohook'), path.join(__dirname, 'node_modules/iohook'));

  // rename the essential folder
  console.log('configuring iohook for this Node version...');
  const oldPath = path.join(__dirname, 'node_modules/iohook/builds/node-v64-darwin-x64');
  const newPath = path.join(__dirname, 'node_modules/iohook/builds', essential);
  if (oldPath !== newPath) {
    fs.renameSync(oldPath, newPath);
  }

  console.log('done')
} catch (error) {
  console.log(error);
}
