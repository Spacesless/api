declare module 'think-mongo' {
  import type { Application } from 'thinkjs';
  function mongo(app: Application): object;
  export = mongo;
}
