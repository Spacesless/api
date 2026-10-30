import type { AstroData, TimeAstroQuery } from '../../types/time';
import Base = require('../base');
import path = require('path');
import fs = require('fs-extra');
import dayjs = require('dayjs');
import isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
import isSameOrBefore = require('dayjs/plugin/isSameOrBefore');

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export = class extends Base {
  /**
   * @summary 星座查询
   * @description 查询星座信息
   */
  async indexAction() {
    const { keyword: queryKeyword } = this.getApiQuery<TimeAstroQuery>();
    const keyword = queryKeyword || new Date();

    const readJsonContent: AstroData = await fs.readJson(path.join(think.ASSETS_PATH, 'xing-zuo.json'));
    const { role, monthRange } = readJsonContent || {};

    let result = {};
    let key = '';
    const isTime = !isNaN(Date.parse(keyword instanceof Date ? keyword.toString() : keyword));
    if (isTime) {
      const momentTime = dayjs(keyword);
      const year = momentTime.year();
      const findRange = monthRange.find(item => {
        return momentTime.isSameOrAfter(`${year}-${item.start}`) && momentTime.isSameOrBefore(`${year}-${item.end}`);
      });
      key = findRange?.name || '摩羯';
    } else {
      key = (keyword as string).replace('座', '');
    }

    result = role[key] || {};
    return this.success(result);
  }
};
