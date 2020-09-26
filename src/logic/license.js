module.exports = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      keyword: {
        required: true,
        uppercase: true
      }
    };
  }
};
