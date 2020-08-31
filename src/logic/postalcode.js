module.exports = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get';

    this.rules = {
      keyword: {
        required: true
      }
    };
  }
};
