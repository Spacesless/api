import type { Poem, PoetryQuery, PoetryWriter, PoetryWriterQuery, PoetrySentence, PoetrySentenceQuery } from '../types/poetry';
import type { MongoFilter } from '../types/common';
import Base = require('./base');

/** Search text is literal, so punctuation cannot become a MongoDB regular expression. */
function contains(value: string) {
  return { $regex: value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') };
}

export = class extends Base {
  /**
   * @summary 古诗文查询
   * @description 查询诗、词、歌、赋和古文，支持作者、朝代、分类和关键词筛选。统一返回分页数据。
   */
  async indexAction() {
    const { author, dynasty, type, keyword, page = 1, pageSize = 10 } = this.getApiQuery<PoetryQuery>();
    const where: MongoFilter = {};
    if (author) where.writer = contains(author);
    if (dynasty) where.dynasty = dynasty;
    if (type) where.type = type;
    if (keyword) where.$or = [
      { title: contains(keyword) },
      { content: contains(keyword) },
      { type: contains(keyword) }
    ];

    const list = await this.mongo<Poem>('poetry-guwen')
      .where(where)
      .order('_id ASC')
      .page(page, pageSize)
      .countSelect();
    return this.success(list);
  }

  /**
   * @summary 古诗文作者查询
   * @description 按姓名或简介关键词查询作者资料。详细介绍保留数据源中的字符串格式；所有查询统一返回分页数据。
   */
  async writerAction() {
    const { name, keyword, page = 1, pageSize = 10 } = this.getApiQuery<PoetryWriterQuery>();
    const where: MongoFilter = {};
    if (name) where.name = contains(name);
    if (keyword) where.$or = [{ name: contains(keyword) }, { simpleIntro: contains(keyword) }];

    const list = await this.mongo<PoetryWriter>('poetry-writer')
      .where(where)
      .order('_id ASC')
      .page(page, pageSize)
      .countSelect();
    return this.success(list);
  }

  /**
   * @summary 古诗文名句查询
   * @description 按原文关键词或出处查询古诗文名句。出处是作者与作品的文字说明，统一返回分页数据。
   */
  async sentenceAction() {
    const { keyword, from, page = 1, pageSize = 10 } = this.getApiQuery<PoetrySentenceQuery>();
    const where: MongoFilter = {};
    if (from) where.from = contains(from);
    if (keyword) where.$or = [{ name: contains(keyword) }, { from: contains(keyword) }];

    const list = await this.mongo<PoetrySentence>('poetry-sentence')
      .where(where)
      .order('_id ASC')
      .page(page, pageSize)
      .countSelect();
    return this.success(list);
  }
};
