module.exports = class extends think.Logic {
  get scope() {
    return {
      id: {
        required: true,
        int: { min: 100 }
      }
    };
  }

  indexAction() {
    this.allowMethods = 'get';

    this.rules = {
      texture: {
        required: true,
        int: { min: 1 }
      }
    };
  }
};
