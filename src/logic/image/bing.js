module.exports = class extends think.Logic {
  listAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      pageSize: {
        int: {
          min: 1,
          max: 100
        }
      }
    };
  }
};
