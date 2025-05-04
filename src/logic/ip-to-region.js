module.exports = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      ip: {
        ip4: true
      }
    };
  }
};
