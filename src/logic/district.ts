export = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get,options';
    this.rules = { code: { string: true, regexp: /^(?:\d{6}|\d{12})$/ } };
  }

  getChildrenAction() {
    this.allowMethods = 'get,options';
    this.rules = { code: { string: true, regexp: /^(?:\d{6}|\d{12})$/ } };
  }

  treeAction() {
    this.allowMethods = 'get,options';
    this.rules = {
      code: { string: true, regexp: /^\d{6}$/ },
      level: { int: { min: 1, max: 4 } }
    };
  }

  detailAction() {
    this.allowMethods = 'get,options';
    this.rules = { code: { required: true, string: true, regexp: /^(?:\d{6}|\d{12})$/ } };
  }

  searchAction() {
    this.allowMethods = 'get,options';
    this.rules = {
      keyword: { required: true, string: true, length: { min: 1, max: 100 } },
      limit: { int: { min: 1, max: 100 } },
      maxLevel: { int: { min: 1, max: 4 } },
      provinceCode: { string: true, regexp: /^\d{2}0000$/ }
    };
  }
};
