const Base = require('./base');

module.exports = class extends Base {
  /**
   * 成语大全
   */
  async indexAction() {
    const { wd, page, pageSize } = this.get();

    let list = [];
    const where = {
      name: {
        $regex: wd
      }
    };

    list = await this.mongo('idiom')
      .where(where)
      .page(page, pageSize)
      .countSelect();

    return this.success(list);
  }

  /**
   * 成语接龙
   */
  async relayAction() {
    const { wd, page, pageSize } = this.get();

    const lastWord = wd.slice(-1);
    let list = [];
    const where = {
      name: {
        $regex: new RegExp('^' + lastWord), // 以上一个成语最后一个词开始
        $ne: wd // 不等于上一个成语
      }
    };

    list = await this.mongo('idiom')
      .where(where)
      .page(page, pageSize)
      .countSelect();

    return this.success(list);
  }
};
