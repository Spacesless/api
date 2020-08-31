module.exports = class extends think.Logic {
  disstsAction() {
    this.allowMethods = 'get';

    this.rules = {
      qquin: {
        required: true
      }
    };
  }

  async listsAction() {
    this.allowMethods = 'get';

    this.rules = {
      disstid: {
        required: true
      }
    };
  }

  async searchAction() {
    this.allowMethods = 'get';

    this.rules = {
      keyword: {
        required: true
      }
    };
  }

  async songsAction() {
    this.allowMethods = 'get';

    this.rules = {
      songmid: {
        required: true
      }
    };
  }

  async lyricAction() {
    this.allowMethods = 'get';

    this.rules = {
      songmid: {
        required: true
      }
    };
  }
};
