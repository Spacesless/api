module.exports = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get';

    this.rules = {
      level: {
        required: true
      }
    };
  }

  searchAction() {
    this.allowMethods = 'get';
  }
};
