module.exports = class extends think.Logic {
  jieqiAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      year: {
        requiredIf: ['month']
      }
    };
  }

  festivalAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      year: {
        requiredIf: ['month']
      }
    };
  }
};
