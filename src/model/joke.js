module.exports = class extends think.Mongo {
  /**
   * 查询随机笑话
   * @param {String} type 类型
   * @param {Number} level 幽默等级
   */
  async randomRecord(type, level) {
    const where = this.getWhere(type, level);

    const count = await this.where(where)
      .count('id');

    const offset = Math.floor(Math.random() * count);

    return this.where(where)
      .limit(offset, 1)
      .select();
  }

  /**
   * 分页查询笑话
   * @param {Number} page 页码
   * @param {Number} pageSize 每页个数
   * @param {String} type 类型
   * @param {Number} level 幽默等级
   * @returns {Promise}
   */
  selectRecord({ page, pageSize, type, level }) {
    const where = this.getWhere(type, level);

    return this.order('date DESC')
      .where(where)
      .page(page, pageSize)
      .countSelect();
  }

  /**
   * 获取查询条件
   * @param {String} type 类型
   * @param {Number} level 幽默等级
   */
  getWhere(type, level) {
    const where = {};
    if (type) {
      where.type = {
        '$eq': type
      };
    }
    if (level) {
      where.level = {
        '$eq': +level
      };
    }

    return where;
  }
};
