const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

const basePath = path.join(think.ASSETS_PATH, 'idcard.json');

module.exports = class extends Base {
  async indexAction() {
    const readJsonContent = await fs.readJson(basePath);
    const id = this.get('id');

    const findId = readJsonContent[id];
    if (findId) {
      return this.success(findId);
    } else {
      return this.fail('未找到相关记录');
    }
  }
};
