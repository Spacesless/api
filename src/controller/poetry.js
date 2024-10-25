const Base = require('./base');

module.exports = class extends Base {
  /**
   * 唐诗、宋词
   * @see https://github.com/chinese-poetry/chinese-poetry 数据来源
   */
  async indexAction() {
    const { author, keyword, page, pageSize } = this.get();

    const where = {};
    if (author) {
      where.author = {
        $regex: author
      };
    }
    // 关键字可以查标题、诗词内容、标签
    if (keyword) {
      where.$or = [
        {
          title: {
            $regex: keyword
          }
        },
        {
          paragraphs: {
            $elemMatch: {
              $regex: keyword
            }
          }
        },
        {
          tags: {
            $elemMatch: {
              $regex: keyword
            }
          }
        }
      ];
    }

    const list = await this.mongo('poetry')
      .where(where)
      .page(page, pageSize)
      .countSelect();

    return this.success(list);
  }
};
