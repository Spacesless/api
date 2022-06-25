const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  /**
   * 根据省份、城市名、城市缩写等关键字查询车牌信息
   */
  async indexAction() {
    const { keyword } = this.get();
    let data = [];
    const jsonPath = path.join(think.ASSETS_PATH, 'license.json');
    const isExist = think.isExist(jsonPath);
    if (!isExist) {
      return this.success(data);
    }
    const licenses = await fs.readJson(jsonPath);
    data = licenses.filter(item => JSON.stringify(item).includes(keyword));
    return this.success(data);
  }
};
