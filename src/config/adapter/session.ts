import path = require('path');
import fileSession = require('think-session-file');

/**
 * session adapter config
 * @type {Object}
 */
export = {
  type: 'file',
  common: {
    cookie: {
      name: 'thinkjs'
      // keys: ['werwer', 'werwer'],
      // signed: true
    }
  },
  file: {
    handle: fileSession,
    sessionPath: path.join(think.ROOT_PATH, 'runtime/session')
  }
};
