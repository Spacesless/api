module.exports = class extends think.Logic {
  get scope() {
    return {
      weaid: {
        required: true
      }
    };
  }

  historyAction() {
    this.rules = {
      date: {
        required: true
      }
    };
  }
};
