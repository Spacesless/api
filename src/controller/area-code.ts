import type { AreaCode, AreaCodeQuery } from '../types/area-code';
import Base = require('./base');
import path = require('path');
import fs = require('fs-extra');

export = class extends Base {
  /**
   * 根据中文名或区号搜索
   * @see https://github.com/jjeejj/CountryCodeAndPhoneCode 数据来源
   *
   * @summary 国际区号
   * @description 一共有 233 个国家或地区，有的地区有两个 电话区号 ,会以这样的格式书写 ： "phoneCode":"0061 9164"
   */
  async indexAction() {
    const { keyword } = this.getApiQuery<AreaCodeQuery>();

    const readJsonContent: AreaCode[] = await fs.readJson(path.join(think.ASSETS_PATH, 'area-code.json'));
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
