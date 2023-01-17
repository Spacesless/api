module.exports = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      id: {
        required: true,
        int: { min: 100 }
      },
      texture: {
        required: true,
        int: { min: 1 }
      }
    };
  }
};
