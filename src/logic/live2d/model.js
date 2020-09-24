module.exports = class extends think.Logic {
  get scope() {
    return {
      id: {
        required: true,
        int: { min: 100 }
      }
    };
  }
};
