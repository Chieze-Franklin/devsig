const activeWin = require('active-win');
const iohook = require('iohook');

const log = require('../services/log');

let activeEvent = {};
let logger;

async function eventHandler(event) {
  const window = await activeWin();
  if (!window) {
    return;
  }
  const isSlack = window.owner.bundleId === 'com.tinyspeck.slackmacgap' ||
    (window.title.startsWith('Slack ') &&
    (window.owner.bundleId === 'com.google.Chrome' ||
    window.owner.bundleId === 'org.mozilla.firefox' ||
    window.owner.bundleId === 'com.apple.Safari'));
  if (isSlack) {
    const now = new Date();
    if (activeEvent.lastTyped && (now.getTime() - (activeEvent.lastTyped.getTime()) > 30000)) {
      activeEvent = {};
    }
    const { shiftKey, altKey, ctrlKey, metaKey, keycode, rawcode, type } = event;
    const keyIsEnter = (!shiftKey && !altKey && !ctrlKey && !metaKey &&
    keycode === 28 && rawcode === 36 && type === 'keydown');
    if (keyIsEnter) {
      if (activeEvent.typing) {
        // the title can be in one of the following formats:
        // Slack | general | Andela | 17 new items // the last part may be missing
        // Slack - Andela
        let titleParts = [], workspace, channel, unread;
        if (window.title.startsWith('Slack | ')) {
          titleParts = window.title.split('|').map(part => part.trim());
          workspace = titleParts[2];
          channel = titleParts[1];
          unread = titleParts[3] ? parseInt(titleParts[3].split(' ')[0]) : undefined;
        } else if (window.title.startsWith('Slack - ')) {
          titleParts = window.title.split('-').map(part => part.trim());
          workspace = titleParts[1];
        }
        logger.info({
          event: 'typing',
          workspace,
          channel,
          unread,
          start: activeEvent.start,
          end: now
        });
        activeEvent = {};
      }
    } else {
      if (!activeEvent.start) {
        activeEvent.start = now;
        activeEvent.typing = true;
      }
      activeEvent.lastTyped = now;
    }
  }
}

iohook.on('keydown', (event) => eventHandler(event));

iohook.name = 'slack';
iohook.init = (options) => {
  logger = log.getLogger('slack');
  iohook.emit('start', 'slack');
}

module.exports = iohook;
