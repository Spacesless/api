const path = require('path');
const nunjucks = require('think-view-nunjucks');

/**
 * view adapter config
 * @type {Object}
 */
module.exports = {
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
