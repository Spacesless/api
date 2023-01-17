module.exports = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      text: {
        required: true,
        length: { max: 1024 }
      },
      type: {
        int: { min: 1, max: 3 }
      },
      el: {
        in: ['low', 'medium', 'quartile', 'highL', 'M', 'Q', 'H']
      },
      margin: {
        int: true
      },
      scale: {
        int: true
      },
      width: {
        int: true
      },
      fgColor: {
        hexColor: true
      },
      bgColor: {
        hexColor: true
      }
    };
  }
};
