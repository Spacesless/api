module.exports = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      level: {
        required: true
      }
    };
  }

  searchAction() {
    this.allowMethods = 'get,options';
  }
};
