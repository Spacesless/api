import type { License, LicenseQuery } from '../types/license';
import Base = require("./base");


export = class extends Base {
  /**
   * @summary 车牌归属地查询
   * @description 根据省份名称、简称，城市名查车牌号，根据车牌号查找城市信息
   */
  async indexAction() {
    const { keyword } = this.getApiQuery<LicenseQuery>();

    const list = await this.mongo<License>("license")
      .where({
        $or: [
          {
            province: {
              $regex: keyword,
            },
          },
          {
            city: {
              $regex: keyword,
            },
          },
          {
            code: {
              $regex: keyword,
            },
          },
          {
            prefix: {
              $regex: keyword,
            },
          },
        ],
      })
      .select();

    return this.success(list);
  }
};
