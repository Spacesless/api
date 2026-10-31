import type { MongoFilter } from '../types/common';
import type { Garbage, GarbageQuery } from '../types/garbage';
import Base = require('./base');

export = class extends Base {
  /**
   * @summary 生活垃圾分类
   */
  async indexAction() {
    const { keyword, category, page, pageSize } = this.getApiQuery<GarbageQuery>();

    const where: MongoFilter = {};
    if (keyword) {
      where.name = {
        $regex: keyword
      };
    }

    if (category) {
      where.category = category;
    }

    const list = await this.mongo<Garbage>('garbage')
      .field('name,category')
      .where(where)
      .page(page, pageSize)
      .countSelect();

    return this.success(list);
  }
};
