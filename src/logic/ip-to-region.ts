export = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      ip: {
        ip: true
      },
      version: {
        in: [4, 6]
      }
    };
  }
};
