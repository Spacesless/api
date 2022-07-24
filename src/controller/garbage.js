const Base = require('./base');

module.exports = class extends Base {
  async indexAction() {
    const { keyword, categroy } = this.get();

    let list = [];
    const where = {};
    if (keyword) {
      where.name = {
        $regex: keyword
      };
    }

    if (categroy) {
      where.categroy = categroy;
    }

    list = await this.mongo('garbage')
      .field('name,categroy')
      .where(where)
      .select();

    return this.success(list);
  }
};
