const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');
const { think } = require('thinkjs');

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);
    this.baseurl = path.join(think.ASSETS_PATH, 'SD');
  }

  async indexAction() {
    const sdList = await fs.readdir(this.baseurl);
    return this.success(sdList);
  }

  async updateAction() {
    const output = think.getdirFiles(path.join(think.ASSETS_PATH, 'tiny/output'));
    const sdList = await fs.readdir(this.baseurl);
    sdList.forEach(item => {
      const findPicture = output.find(element => element.includes(item));
      if (findPicture) {
        const src = path.join(think.ASSETS_PATH, 'tiny/output/' + findPicture);
        if (think.isExist(src)) {
          const source = path.join(think.ASSETS_PATH, 'tiny/', findPicture);
          fs.remove(source);
          const dest = path.join(this.baseurl, item, findPicture);
          fs.move(src, dest, err => {
            if (err) return console.error(err);
          });
        }
      }
    });
  }
};
