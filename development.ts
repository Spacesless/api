import path = require('node:path');
import type { ApplicationConstructor } from './src/types/application';

const Application = require('thinkjs') as ApplicationConstructor;
const instance = new Application({
  ROOT_PATH: path.resolve(__dirname, '..'),
  APP_PATH: path.join(__dirname, 'src'),
  env: 'development'
});

// tsc-watch restarts this process only after a successful compilation.
instance.run();
