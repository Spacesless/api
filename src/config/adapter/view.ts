import path = require('path');
import nunjucks = require('think-view-nunjucks');

/**
 * view adapter config
 * @type {Object}
 */
export = {
  type: 'nunjucks',
  common: {
    viewPath: path.join(think.ROOT_PATH, 'view'),
    sep: '_',
    extname: '.html'
  },
  nunjucks: {
    handle: nunjucks
  }
};
