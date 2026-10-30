import type { PostalCode, PostalcodeQuery } from '../types/postalcode';
import Base = require('./base');


export = class extends Base {
  /**
   * @summary 邮政编码查询
   * @description 根据地区、省份、城市查找邮政编码
   */
  async indexAction() {
    const { keyword } = this.getApiQuery<PostalcodeQuery>();

    const list = await this.mongo<PostalCode>('postalcode')
      .where({
        $or: [
          {
            province: {
              $regex: keyword
            }
          },
          {
            city: {
              $regex: keyword
            }
          },
          {
            area: {
              $regex: keyword
            }
          }
        ]
      })
      .select();

    return this.success(list);
  }
};
