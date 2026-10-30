import type { PhoneNumber, PhoneNumberQuery } from '../types/phone-number';
import Base = require("./base");
import path = require("path");
import fs = require("fs-extra");

export = class extends Base {
  /**
   * @see https://www.juhe.cn/market/product/id/10059 数据来源
   *
   * @summary 常用电话大全
   * @description 全国公众服务电话号码，常用电话大全。
   */
  async indexAction() {
    const { cate, keyword } = this.getApiQuery<PhoneNumberQuery>();

    const readJsonContent: PhoneNumber[] = await fs.readJson(
      path.join(think.ASSETS_PATH, "phone-number.json"),
    );
    const phoneNumbers = readJsonContent || [];

    const data = phoneNumbers.filter((item) => {
      const hasCate = cate ? item.cate.includes(cate) : true;
      const hasKeyword = keyword
        ? item.name.includes(keyword) || item.tel.includes(keyword)
        : true;

      return hasCate && hasKeyword;
    });

    return this.success(data);
  }
};
