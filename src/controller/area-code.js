const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  /**
   * 根据中文名或区号搜索
   * @see https://github.com/jjeejj/CountryCodeAndPhoneCode 数据来源
   */
  async indexAction() {
    const { keyword } = this.get();

    const readJsonContent = await fs.readJson(path.join(think.ASSETS_PATH, 'area-code.json'));
    const areaCodes = readJsonContent || [];

    let data = [];

    if (keyword) {
      data = areaCodes.filter(item => item.name.includes(keyword) || item.phoneCode.includes(keyword));
    } else {
      data = areaCodes;
    }

    return this.success(data);
  }
};
