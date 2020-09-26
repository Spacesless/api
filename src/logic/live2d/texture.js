module.exports = class extends think.Logic {
  get scope() {
    return {
      id: {
        required: true,
        int: { min: 100 }
      }
    };
  }

  switchAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      texture: {
        required: true,
        int: { min: 1 }
      }
    };
  }
};
