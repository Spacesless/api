module.exports = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      date: {
        date: true
      }
    };
  }

  listAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      page: {
        int: { min: 1 }
      },
      pageSize: {
        int: {
          min: 1,
          max: 100
        }
      }
    };
  }
};
