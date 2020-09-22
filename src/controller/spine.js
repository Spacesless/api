const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);
    this.baseurl = path.join(think.ASSETS_PATH, 'SD');
  }

  async indexAction() {
    const sdList = await fs.readdir(this.baseurl);
    return this.success(sdList);
  }
};
