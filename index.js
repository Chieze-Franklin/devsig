const activeWin = require('active-win');
const cron = require("node-cron");
const iohook = require('iohook');

// iohook.on("mousedown",function(msg){console.log(msg);});

// iohook.on("keypress", async function(msg){
//   console.log(msg);
// });

// iohook.on("keydown", async function(msg){
//   console.log('>>>>>>>>>>>>>>');console.log(msg);
//   const result = await activeWin();
//   console.log(result);
// });

// iohook.on("keyup",function(msg){console.log(msg);});

// iohook.on("mouseclick",function(msg){console.log(msg)});

// iohook.on("mousewheel",function(msg){console.log(msg)});

// iohook.on("mousemove",function(msg){console.log(msg)});

// iohook.on("mousedrag",function(msg){console.log(msg)});

iohook.start();
// iohook.setDebug(true);

cron.schedule("*/10 * * * * *", async () => {
  const result = await activeWin();
  console.log(result);
});
