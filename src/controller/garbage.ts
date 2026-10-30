import type { MongoFilter } from '../types/data';
import Base = require('./base');

export = class extends Base {
  async indexAction() {
    const { keyword, category, page, pageSize } = this.getApiQuery('/garbage');

    const where: MongoFilter = {};
    if (keyword) {
      where.name = {
        $regex: keyword
      };
    }

    if (category) {
      where.category = category;
    }

    const list = await this.mongo('garbage')
      .field('name,category')
      .where(where)
      .page(page, pageSize)
      .countSelect();

    return this.success(list);
  }
};
