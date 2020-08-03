module.exports = class extends think.Logic {
  indexAction() {
    this.rules = {
      keyword: {
        required: true,
        uppercase: true
      }
    };
  }
};
