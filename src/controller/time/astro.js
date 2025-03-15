const Base = require('../base');
const path = require('path');
const fs = require('fs-extra');
const dayjs = require('dayjs');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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
      const momentTime = dayjs(keyword);
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
