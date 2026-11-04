export = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get,options';
    this.rules = {
      name: { string: true, length: { max: 100 } },
      keyword: { string: true, length: { max: 100 } },
      category: { in: ['dog', 'cat', 'turtle', 'rabbit', 'fish', 'bird', 'rodent', 'pig', 'reptile'] },
      size: { string: true, length: { max: 30 } },
      coat: { string: true, length: { max: 30 } },
      origin: { string: true, length: { max: 100 } },
      page: { int: { min: 1 } },
      pageSize: { int: { min: 1, max: 50 } }
    };
  }

};
