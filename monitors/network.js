const cron = require('node-cron');
const emitter = require('events').EventEmitter;
const http = require('http');
const isOnline = require('is-online');

const log = require('../services/log');

const chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()_+`-=[]{}|;':,./<>?";
let connected = false;
const em = new emitter();
let lastDownSpeed = 0, lastUpSpeed = 0;
let logger;

function checkDownloadSpeed(baseUrl, fileSize) {
  let startTime;
  return new Promise((resolve, _) => {
    return http.get(baseUrl, response => {
      response.once('data', () => {
        startTime = new Date().getTime();
      });

      response.once('end', () => {
        const endTime = new Date().getTime();
        const duration = (endTime - startTime) / 1000;
        const bitsLoaded = fileSize * 8;
        const bps = (bitsLoaded / duration).toFixed(2);
        const kbps = (bps / 1024).toFixed(2);
        const mbps = (kbps / 1024).toFixed(2);
        resolve({bps, kbps, mbps});
      });
    });
  }).catch(error => {
    throw new Error(error);
  });
}

function checkUploadSpeed(options) {
  let startTime;
  const data = '{"data": "' + generateTestData(20) + '"}';
  return new Promise((resolve, _) => {
    var req = http.request(options, res => {
      res.setEncoding('utf8');
      res.on('data', () => {
        startTime = new Date().getTime();
      });
      res.on('end', () => {
        const endTime = new Date().getTime();
        const duration = (endTime - startTime) / 1000;
        const bitsLoaded = 20 * 8;
        const bps = (bitsLoaded / duration).toFixed(2);
        const kbps = (bps / 1024).toFixed(2);
        const mbps = (kbps / 1024).toFixed(2);
        resolve({bps, kbps, mbps});
      });
    });
    req.write(data);
    req.end();
  }).catch(error => {
    throw new Error(error);
  });
}

function generateTestData(sizeInKmb) {
  const iterations = sizeInKmb * 1024; //get byte count
  let result = '';
  for (var index = 0; index < iterations; index++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function getNetworkDownloadSpeed() {
  const baseUrl = 'http://eu.httpbin.org/stream-bytes/50000000';
  const fileSize = 500000;
  const speed = await checkDownloadSpeed(baseUrl, fileSize);
  return speed;
}

async function getNetworkUploadSpeed() {
  const options = {
    hostname: 'www.google.com',
    port: 80,
    path: '/catchers/544b09b4599c1d0200000289',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const speed = await checkUploadSpeed(options);
  return speed;
}

em.name = 'network';
em.init = (options) => {
  logger = log.getLogger('network');
}
em.start = () => {
  em.emit('start', 'network');
  cron.schedule("* * * * *", async () => {
    connected = await isOnline();
    if (connected) {
      const down = await getNetworkDownloadSpeed();
      const up = await getNetworkUploadSpeed();
      logger.info({
        connected,
        downSpeed: down.mbps === 'Infinity' ? lastDownSpeed : lastDownSpeed = parseFloat(down.mbps),
        upSpeed: up.mbps === 'Infinity' ? lastUpSpeed : lastUpSpeed = parseFloat(up.mbps)
      })
    } else {
      logger.info({
        connected,
        downSpeed: 0,
        upSpeed: 0
      })
    }
  });
}

module.exports = em;
