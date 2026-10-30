export = class extends think.Logic {
  get scope() {
    return {
      page: { int: { min: 1 } },
      pageSize: { int: { min: 1, max: 50 } },
      keyword: { string: true, length: { max: 100 } }
    };
  }

  wordAction() {
    this.allowMethods = 'get,options';
    this.rules = {
      word: { string: true, length: { max: 10 } },
      radicals: { string: true, length: { max: 10 } },
      strokes: { int: { min: 1, max: 100 } }
    };
  }

  xiehouyuAction() {
    this.allowMethods = 'get,options';
    this.rules = {
      riddle: { string: true, length: { max: 100 } },
      answer: { string: true, length: { max: 100 } }
    };
  }

  coupletAction() {
    this.allowMethods = 'get,options';
    this.rules = {
      up: { string: true, length: { max: 100 } },
      down: { string: true, length: { max: 100 } }
    };
  }
};
