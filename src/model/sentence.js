const fields = 'id,uuid,commit_from,created_at,creator,from,from_who,hitokoto,length,type';

module.exports = class extends think.Mongo {
  /**
   * 查询一言
   * @returns {Promise}
   */
  async findRecord(id) {
    return this.field(fields)
      .where({ id })
      .find();
  }

  /**
   * 随机一言
   * @returns {Promise}
   */
  async randomRecord(params) {
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
  selectRecord(params) {
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
  getWhere(type, minLength, maxLength) {
    const where = {};
    if (type) {
      where.type = {
        '$in': type.split(',')
      };
    }
    if (!think.isEmpty(minLength)) {
      where.length = {
        '$gte': +minLength
      };
    }
    if (!think.isEmpty(maxLength)) {
      where.length = {
        '$lte': +maxLength
      };
    }
    if (!think.isEmpty(minLength) && !think.isEmpty(maxLength)) {
      where.length = {
        '$gte': +minLength,
        '$lte': maxLength
      };
    }

    return where;
  }
};
