module.exports = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get';

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
