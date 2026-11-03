export = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get,options';
    this.rules = {
      year: { required: true, int: { min: 1900, max: 2099 } },
      month: { required: true, int: { min: 1, max: 12 } },
      day: { required: true, int: { min: 1, max: 31 } },
      hour: { required: true, int: { min: 0, max: 23 } },
      minute: { int: { min: 0, max: 59 } },
      sect: { in: [1, 2] },
      date: { length: { min: 10, max: 10 } }
    };
  }
};
