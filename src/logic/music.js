module.exports = class extends think.Logic {
  cdListAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      qquin: {
        required: true
      }
    };
  }

  songListAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      disstid: {
        required: true
      }
    };
  }

  searchAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      keyword: {
        required: true
      }
    };
  }

  songUrlAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      songmid: {
        required: true
      }
    };
  }

  lyricAction() {
    this.allowMethods = 'get,options';

    this.rules = {
      songmid: {
        required: true
      }
    };
  }
};
