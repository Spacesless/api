import type { PhoneNumber } from '../types/data';
import Base = require('./base');
import path = require('path');
import fs = require('fs-extra');

export = class extends Base {
  /**
   * 常用电话号码大全
   * @see https://www.juhe.cn/market/product/id/10059 数据来源
   */
  async indexAction() {
    const { cate, keyword } = this.getApiQuery('/phone-number');

    const readJsonContent: PhoneNumber[] = await fs.readJson(path.join(think.ASSETS_PATH, 'phone-number.json'));
    const phoneNumbers = readJsonContent || [];

    const data = phoneNumbers.filter(item => {
      const hasCate = cate ? item.cate.includes(cate) : true;
      const hasKeyword = keyword ? item.name.includes(keyword) || item.tel.includes(keyword) : true;

      return hasCate && hasKeyword;
    });

    return this.success(data);
  }
};
