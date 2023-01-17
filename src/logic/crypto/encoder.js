module.exports = class extends think.Logic {
  indexAction() {
    this.rules = {
      message: {
        required: true,
        length: { max: 1024 }
      },
      algorithm: {
        in: ['Base64', 'Hex', 'Utf8', 'Utf16']
      },
      type: {
        int: { min: 0, max: 1 }
      }
    };
  }
};
