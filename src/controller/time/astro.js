const Base = require('../base');
const path = require('path');
const fs = require('fs-extra');
const moment = require('moment');

module.exports = class extends Base {
  async indexAction() {
    let { keyword } = this.get();
    keyword = keyword || new Date();

    const readJsonContent = await fs.readJson(path.join(think.ASSETS_PATH, 'xing-zuo.json'));
    const { role, monthRange } = readJsonContent || {};

    let result = {};
    let key = '';
    const isTime = !isNaN(Date.parse(keyword));
    if (isTime) {
      const momentTime = moment(keyword);
      const year = momentTime.year();
      const findRange = monthRange.find(item => {
        return momentTime.isSameOrAfter(`${year}-${item.start}`) && momentTime.isSameOrBefore(`${year}-${item.end}`);
      });
      key = findRange?.name || '摩羯';
    } else {
      key = keyword.replace('座', '');
    }

    result = role[key] || {};
    return this.success(result);
  }
};
