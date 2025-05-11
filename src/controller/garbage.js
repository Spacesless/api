const Base = require('./base');

module.exports = class extends Base {
  async indexAction() {
    const { keyword, category, page, pageSize } = this.get();

    let list = [];
    const where = {};
    if (keyword) {
      where.name = {
        $regex: keyword
      };
    }

    if (category) {
      where.category = category;
    }

    list = await this.mongo('garbage')
      .field('name,category')
      .where(where)
      .page(page, pageSize)
      .countSelect();

    return this.success(list);
  }
};
