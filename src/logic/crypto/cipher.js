module.exports = class extends think.Logic {
  indexAction() {
    this.rules = {
      message: {
        required: true,
        length: { max: 1024 }
      },
      secret: {
        required: true,
        length: { max: 1024 }
      },
      algorithm: {
        required: true,
        in: ['AES', 'DES', 'TripleDES', 'Rabbit', 'RC4', 'RC4Drop']
      },
      type: {
        int: { min: 0, max: 1 }
      }
    };
  }
};
