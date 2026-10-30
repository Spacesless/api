import path = require('path');
import view = require('think-view');
import model = require('think-model');
import cache = require('think-cache');
import session = require('think-session');
import mongo = require('think-mongo');

export = [
  view, // make application support view
  model(think.app),
  mongo(think.app),
  cache,
  session,
  {
    think: {
      ASSETS_PATH: path.join(think.ROOT_PATH, 'www')
    }
  }
];
