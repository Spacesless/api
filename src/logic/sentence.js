module.exports = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      minLength: {
        int: true
      },
      maxLength: {
        int: true
      }
    };
  }

  getAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      id: {
        required: true,
        int: true
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
      },
      minLength: {
        int: true
      },
      maxLength: {
        int: true
      }
    };
  }
};
