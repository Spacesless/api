import type { Poem, PoetryQuery } from '../types/poetry';
import type { MongoFilter } from '../types/common';
import Base = require("./base");

export = class extends Base {
  /**
   * @see https://github.com/chinese-poetry/chinese-poetry 数据来源
   *
   * @summary 中文诗歌
   * @description 中文诗歌，目前收录诗经、唐诗、宋词、元曲等诗歌12000多首，部分存在繁体字。
   */
  async indexAction() {
    const { author, keyword, page, pageSize } = this.getApiQuery<PoetryQuery>();

    const where: MongoFilter = {};
    if (author) {
      where.author = {
        $regex: author,
      };
    }
    // 关键字可以查标题、诗词内容、标签
    if (keyword) {
      where.$or = [
        {
          title: {
            $regex: keyword,
          },
        },
        {
          paragraphs: {
            $elemMatch: {
              $regex: keyword,
            },
          },
        },
        {
          tags: {
            $elemMatch: {
              $regex: keyword,
            },
          },
        },
      ];
    }

    const list = await this.mongo<Poem>("poetry")
      .where(where)
      .page(page, pageSize)
      .countSelect();

    return this.success(list);
  }
};
