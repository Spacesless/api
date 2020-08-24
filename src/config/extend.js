const path = require('path');
const view = require('think-view');
const model = require('think-model');
const cache = require('think-cache');
const session = require('think-session');

module.exports = [
  view, // make application support view
  model(think.app),
  cache,
  session,
  {
    think: {
      ASSETS_PATH: path.join(think.ROOT_PATH, 'www')
    }
  }
];
