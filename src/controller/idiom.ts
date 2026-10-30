import type { Idiom, IdiomQuery, IdiomRelayQuery } from '../types/idiom';
import Base = require("./base");


export = class extends Base {
  /**
   * @summary 成语大全
   * @description 总计3万多个成语，包含发音、解释、出自典故、近义词、反义词、例句等数据
   */
  async indexAction() {
    const { wd, page, pageSize } = this.getApiQuery<IdiomQuery>();

    const where = {
      name: {
        $regex: wd,
      },
    };

    const list = await this.mongo<Idiom>("idiom")
      .where(where)
      .page(page, pageSize)
      .countSelect();

    return this.success(list);
  }

  /**
   * @summary 成语接龙
   * @description 总计3万多个成语，包含发音、解释、出自典故、近义词、反义词、例句等数据，可以进行成语接龙游戏
   */
  async relayAction() {
    const { wd, page, pageSize } = this.getApiQuery<IdiomRelayQuery>();

    const lastWord = wd.slice(-1);
    const where = {
      name: {
        $regex: new RegExp("^" + lastWord), // 以上一个成语最后一个词开始
        $ne: wd, // 不等于上一个成语
      },
    };

    const list = await this.mongo<Idiom>("idiom")
      .where(where)
      .page(page, pageSize)
      .countSelect();

    return this.success(list);
  }
};
