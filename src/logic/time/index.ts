export = class extends think.Logic {
  calendarAction() {
    this.allowMethods = 'get,options';
    this.rules = {
      year: { int: { min: 1900, max: 2099 } },
      month: { int: { min: 1, max: 12 } }
    };
  }

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
