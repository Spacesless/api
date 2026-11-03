export = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get,options';
    this.rules = {
      date: {
        string: true,
        length: { min: 5, max: 5 },
        regexp: /^(?:(?:01|03|05|07|08|10|12)-(?:0[1-9]|[12]\d|3[01])|(?:04|06|09|11)-(?:0[1-9]|[12]\d|30)|02-(?:0[1-9]|1\d|2\d))$/
      },
      type: { in: ['event', 'birth', 'death'] }
    };
  }

  searchAction() {
    this.allowMethods = 'get,options';
    this.rules = {
      keyword: { string: true, length: { max: 100 } },
      type: { in: ['event', 'birth', 'death'] },
      startYear: { int: { min: -9999, max: 9999 } },
      endYear: { int: { min: -9999, max: 9999 } },
      page: { int: { min: 1 } },
      pageSize: { int: { min: 1, max: 50 } }
    };
  }
};
