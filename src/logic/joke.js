module.exports = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      level: {
        in: [1, 5]
      },
      type: {
        in: ['反转', '谐音', '谐义', '其他']
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
      level: {
        in: [1, 5]
      },
      type: {
        in: ['反转', '谐音', '谐义', '其他']
      }
    };
  }
};
