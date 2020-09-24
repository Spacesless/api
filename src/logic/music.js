module.exports = class extends think.Logic {
  cdListAction() {
    this.allowMethods = 'get';

    this.rules = {
      qquin: {
        required: true
      }
    };
  }

  songListAction() {
    this.allowMethods = 'get';

    this.rules = {
      disstid: {
        required: true
      }
    };
  }

  searchAction() {
    this.allowMethods = 'get';

    this.rules = {
      keyword: {
        required: true
      }
    };
  }

  songUrlAction() {
    this.allowMethods = 'get';

    this.rules = {
      songmid: {
        required: true
      }
    };
  }

  lyricAction() {
    this.allowMethods = 'get';

    this.rules = {
      songmid: {
        required: true
      }
    };
  }
};
