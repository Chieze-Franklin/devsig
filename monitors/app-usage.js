const activeWin = require('active-win');
const iohook = require('iohook');

// iohook.on("mousedown",function(msg){console.log(msg);});

iohook.on("keypress", async function(msg){
  console.log(msg);
});

// iohook.on("keydown", async function(msg){
//   console.log('>>>>>>>>>>>>>>');console.log(msg);
//   const result = await activeWin();
//   console.log(result);
// });

iohook.on("keyup",function(msg){console.log(msg);});

// iohook.on("mouseclick",function(msg){console.log(msg)});

// iohook.on("mousewheel",function(msg){console.log(msg)});

// iohook.on("mousemove",function(msg){console.log(msg)});

// iohook.on("mousedrag",function(msg){console.log(msg)});

// iohook.setDebug(true);

iohook.init = (options) => {}
iohook.name = 'app-usage';

module.exports = iohook;
