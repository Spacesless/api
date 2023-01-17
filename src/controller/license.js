const Base = require('./base');

module.exports = class extends Base {
  /**
   * 根据省份、城市名、城市缩写等关键字查询车牌信息
   */
  async indexAction() {
    const { keyword } = this.get();

    const list = await this.mongo('license')
      .where({
        $or: [
          {
            province: {
              $regex: keyword
            }
          },
          {
            city: {
              $regex: keyword
            }
          },
          {
            code: {
              $regex: keyword
            }
          },
          {
            prefix: {
              $regex: keyword
            }
          }
        ]
      })
      .select();

    return this.success(list);
  }
};
