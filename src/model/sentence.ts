import type { Sentence, SentenceFilter } from '../types/sentence';
import type { MongoFilter, NumericQuery } from '../types/common';
const fields = 'id,uuid,commit_from,created_at,creator,from,from_who,hitokoto,length,type';

export = class extends think.Mongo<Sentence> {
  /**
   * 查询一言
   * @returns {Promise}
   */
  async findRecord(id: NumericQuery) {
    return this.field(fields)
      .where({ id })
      .find();
  }

  /**
   * 随机一言
   * @returns {Promise}
   */
  async randomRecord(params: SentenceFilter) {
    const { type, minLength, maxLength } = params;

    const where = this.getWhere(type, minLength, maxLength);

    const count = await this.where(where)
      .count('id');

    const offset = Math.floor(Math.random() * count);

    return this.field(fields)
      .where(where)
      .limit(offset, 1)
      .select();
  }

  /**
   * 分页查询一言
   * @param {Number} page 页码
   * @param {Number} pageSize 每页个数
   * @returns {Promise}
   */
  selectRecord(params: SentenceFilter) {
    const { page, pageSize, type, minLength, maxLength } = params;

    const where = this.getWhere(type, minLength, maxLength);

    return this.field(fields)
      .where(where)
      .order('created_at DESC')
      .page(page, pageSize)
      .countSelect();
  }

  /**
   * 获取查询条件
   * @param {String} type 类型
   * @param {Number} minLength 最小长度
   * @param {Number} maxLength 最大长度
   */
  getWhere(type?: string, minLength?: NumericQuery, maxLength?: NumericQuery) {
    const where: MongoFilter = {};
    if (type) {
      where.type = {
        '$in': type.split(',')
      };
    }
    if (!think.isEmpty(minLength)) {
      where.length = {
        '$gte': Number(minLength)
      };
    }
    if (!think.isEmpty(maxLength)) {
      where.length = {
        '$lte': Number(maxLength)
      };
    }
    if (!think.isEmpty(minLength) && !think.isEmpty(maxLength)) {
      where.length = {
        '$gte': Number(minLength),
        '$lte': maxLength
      };
    }

    return where;
  }
};
