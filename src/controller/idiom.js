const Base = require('./base');

module.exports = class extends Base {
  async indexAction() {
    const { wd } = this.get();

    let list = [];
    const where = {
      name: {
        $regex: wd
      }
    };

    list = await this.mongo('idiom')
      .where(where)
      .select();

    return this.success(list);
  }

  async relayAction() {
    const { wd, page, pageSize } = this.get();

    const lastWord = wd.slice(-1);
    let list = [];
    const where = {
      name: {
        $regex: new RegExp(lastWord + '$'),
        $ne: wd
      }
    };

    list = await this.mongo('idiom')
      .where(where)
      .page(page, pageSize)
      .countSelect();

    return this.success(list);
  }
};
