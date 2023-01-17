module.exports = class extends think.Logic {
  indexAction() {
    this.rules = {
      text: {
        string: true,
        required: true,
        length: { max: 1024 }
      },
      style: {
        int: { min: 0, max: 5 }
      },
      segment: {
        int: { min: 1, max: 5 }
      },
      heteronym: {
        int: { min: 0, max: 1 }
      },
      group: {
        int: { min: 0, max: 1 }
      },
      mode: {
        int: { min: 0, max: 1 }
      },
      compact: {
        int: { min: 0, max: 1 }
      }
    };
  }
};
