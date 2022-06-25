const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  async indexAction() {
    const { keyword } = this.get();
    let data = [];
    const jsonPath = path.join(think.ASSETS_PATH, 'postalcode.json');
    const isExist = think.isExist(jsonPath);
    if (!isExist) {
      return this.success(data);
    }
    const postals = await fs.readJson(jsonPath);
    data = postals.filter(item => item.province.includes(keyword) || item.city.includes(keyword) || item.area.includes(keyword));
    return this.success(data);
  }
};
