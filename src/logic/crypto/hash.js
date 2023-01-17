module.exports = class extends think.Logic {
  get scope() {
    return {
      message: {
        required: true,
        length: { max: 1024 }
      },
      textCase: {
        in: ['upper', 'lower']
      }
    };
  }

  md5Action() {
    this.rules = {
      size: {
        in: [16, 32]
      }
    };
  }

  shaAction() {
    this.rules = {
      algorithm: {
        in: [1, 256, 512]
      }
    };
  }

  uuidAction() {
    this.rules = {
      message: {
        required: false
      },
      verion: {
        in: [1, 4]
      },
      count: {
        int: { min: 1, max: 100 }
      }
    };
  }
};
