import type { Couplet, CoupletQuery, DictionaryWord, DictionaryWordQuery, Xiehouyu, XiehouyuQuery } from '../types/dictionary';
import type { MongoFilter } from '../types/common';
import Base = require('./base');

function contains(value: string) {
  return { $regex: value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') };
}

export = class extends Base {
  /**
   * @summary 汉字词典
   * @description 查询汉字的拼音、笔画、部首和释义。汉字同时匹配原字形，同字多条记录分别返回；数据源的部首和读音信息可能不完整。所有查询统一返回分页结果。
   */
  async wordAction() {
    const { word, radicals, strokes, keyword, page = 1, pageSize = 10 } = this.getApiQuery<DictionaryWordQuery>();
    const where: MongoFilter = {};
    if (radicals) where.radicals = radicals;
    if (strokes !== undefined) where.strokes = String(strokes);

    const conditions: MongoFilter[] = [];
    if (word) conditions.push({ $or: [{ word }, { oldword: word }] });
    if (keyword) conditions.push({ $or: [
      { word: contains(keyword) },
      { oldword: contains(keyword) },
      { explanation: contains(keyword) }
    ] });
    if (conditions.length) where.$and = conditions;

    const list = await this.mongo<DictionaryWord>('dictionary-word')
      .where(where).order('_id ASC').page(page, pageSize).countSelect();
    return this.success(list);
  }

  /**
   * @summary 歇后语查询
   * @description 按前半句查答案、按答案反查或搜索关键词，保留数据源的多个答案和原始标点。所有查询统一返回分页结果。
   */
  async xiehouyuAction() {
    const { riddle, answer, keyword, page = 1, pageSize = 10 } = this.getApiQuery<XiehouyuQuery>();
    const where: MongoFilter = {};
    if (riddle) where.riddle = contains(riddle);
    if (answer) where.answer = contains(answer);
    if (keyword) where.$or = [{ riddle: contains(keyword) }, { answer: contains(keyword) }];

    const list = await this.mongo<Xiehouyu>('dictionary-xiehouyu')
      .where(where).order('_id ASC').page(page, pageSize).countSelect();
    return this.success(list);
  }

  /**
   * @summary 对联查询
   * @description 按上联精确查询已有下联，或按下联反查、搜索关键词。同一上联可能对应多条下联，统一返回分页结果；本接口检索已有配对，不生成新对联。
   */
  async coupletAction() {
    const { up, down, keyword, page = 1, pageSize = 10 } = this.getApiQuery<CoupletQuery>();
    const where: MongoFilter = {};
    if (up) where.up = up;
    if (down) where.down = down;
    if (keyword) where.$or = [{ up: contains(keyword) }, { down: contains(keyword) }];

    const list = await this.mongo<Couplet>('dictionary-couplet')
      .where(where).order('_id ASC').page(page, pageSize).countSelect();
    return this.success(list);
  }
};
