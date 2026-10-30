export = class extends think.Logic {
  get scope() {
    return {
      page: { int: { min: 1 } },
      pageSize: { int: { min: 1, max: 50 } }
    };
  }

  indexAction() {
    this.allowMethods = 'get,options';
    this.rules = {
      author: { string: true, length: { max: 50 } },
      dynasty: { string: true, length: { max: 50 } },
      type: { string: true, length: { max: 50 } },
      keyword: { string: true, length: { max: 100 } }
    };
  }

  writerAction() {
    this.allowMethods = 'get,options';
    this.rules = {
      name: { string: true, length: { max: 50 } },
      keyword: { string: true, length: { max: 100 } }
    };
  }

  sentenceAction() {
    this.allowMethods = 'get,options';
    this.rules = {
      from: { string: true, length: { max: 100 } },
      keyword: { string: true, length: { max: 100 } }
    };
  }
};
