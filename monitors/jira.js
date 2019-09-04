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
  const isJira = window.title.endsWith(' - Jira') &&
    (window.owner.bundleId === 'com.google.Chrome' ||
    window.owner.bundleId === 'org.mozilla.firefox' ||
    window.owner.bundleId === 'com.apple.Safari');
  if (isJira) {
    const now = new Date();
    if (activeEvent.lastTyped && (now.getTime() - (activeEvent.lastTyped.getTime()) > 30000)) {
      activeEvent = {};
    }
    const { button, clicks, shiftKey, altKey, ctrlKey, metaKey, keycode, rawcode, type } = event;
    const enterKeyOrMouseClick = (!shiftKey && !altKey && !ctrlKey && !metaKey &&
    keycode === 28 && rawcode === 36 && type === 'keydown') ||
    (button === 1 && clicks === 1 && type === 'mouseclick');
    if (enterKeyOrMouseClick) {
      if (activeEvent.typing) {
        const titleParts = window.title.split('-').map(part => part.trim());
        logger.info({
          view: titleParts[0],
          event: 'typing',
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
iohook.on('mouseclick', (event) => eventHandler(event));

iohook.name = 'jira';
iohook.init = (options) => {
  logger = log.getLogger('jira');
  iohook.emit('start', 'jira');
}

module.exports = iohook;
