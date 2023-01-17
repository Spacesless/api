module.exports = class extends think.Logic {
  get scope() {
    return {
      wd: {
        string: true,
        required: true,
        length: { max: 100 }
      }
    };
  }

  replyAction() {
    this.rules = {
      page: {
        int: { min: 1 }
      },
      pageSize: {
        int: { min: 1, max: 100 }
      }
    };
  }
};
