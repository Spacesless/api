import type { Pet, PetQuery } from '../types/pet';
import type { MongoFilter } from '../types/common';
import Base = require('./base');

function contains(value: string) {
  return { $regex: value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') };
}

export = class extends Base {
  /**
   * @summary 宠物大全
   * @description 按名称、别名、分类、体型、毛发和原产地组合筛选，分页返回完整资料，包含简介、特点、评分及代表图绝对地址（按当前请求域名拼接）。每页默认20条，最多50条。评分统一0至5分，允许半分；猫狗详情页优先，宠物大全补缺，空值表示未知或明确不适用。
   */
  async indexAction() {
    const { name, keyword, category, size, coat, origin, page = 1, pageSize = 20 } = this.getApiQuery<PetQuery>();
    const where: MongoFilter = {};
    if (category) where.category = category;
    if (size) where.size = size;
    if (coat) where.coat = coat;
    if (origin) where.origin = contains(origin);
    const conditions: MongoFilter[] = [];
    if (name) conditions.push({ $or: [{ name }, { fullName: name }, { aliases: name }] });
    if (keyword) conditions.push({ $or: [{ name: contains(keyword) }, { fullName: contains(keyword) }, { aliases: contains(keyword) }] });
    if (conditions.length) where.$and = conditions;
    const list = await this.mongo<Pet>('pet')
      .where(where).field({ _id: 0 })
      .order('category ASC,name ASC,_id ASC').page(page, pageSize).countSelect();
    list.data = list.data.map(pet => ({
      ...pet,
      image: pet.image ? new URL(pet.image, this.ctx.origin).href : null
    }));
    return this.success(list);
  }

};
