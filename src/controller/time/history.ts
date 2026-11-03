import type { HistoryEvent, HistoryQuery, HistorySearchQuery } from '../../types/history';
import type { MongoFilter } from '../../types/common';
import Base = require('../base');

export = class extends Base {
  /**
   * @summary 历史上的今天
   * @description 按月日查询历史事件、人物出生和逝世，默认北京时间当天，支持2月29日。返回纯文本事件列表，按年份升序排列，公元前年份为负数，无分页。
   */
  async indexAction() {
    const { date = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(5, 10), type } = this.getApiQuery<HistoryQuery>();
    const where: MongoFilter = { date };
    if (type) where.type = type;
    const events = await this.mongo<HistoryEvent>('history-today')
      .where(where).field({ _id: 0, date: 1, year: 1, type: 1, title: 1 })
      .order('year ASC,type ASC,title ASC').select();
    return this.success(events);
  }

  /**
   * @summary 历史事件搜索
   * @description 跨日期按标题关键词、类型和年份范围组合检索，所有参数可选。年份范围包含首尾年份，公元前用负数且无公元0年。按年份、月日升序返回分页结果，默认每页20条，最多50条。
   */
  async searchAction() {
    const { keyword, type, startYear, endYear, page = 1, pageSize = 20 } = this.getApiQuery<HistorySearchQuery>();
    const start = startYear === undefined ? undefined : Number(startYear);
    const end = endYear === undefined ? undefined : Number(endYear);
    if (start === 0 || end === 0) return this.fail('年份不能为0');
    if (start !== undefined && end !== undefined && start > end) return this.fail('起始年份不能大于结束年份');

    const where: MongoFilter = {};
    if (keyword) where.title = { $regex: keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (type) where.type = type;
    const years: MongoFilter = {};
    if (start !== undefined) years.$gte = start;
    if (end !== undefined) years.$lte = end;
    if (Object.keys(years).length) where.year = years;
    const events = await this.mongo<HistoryEvent>('history-today')
      .where(where).field({ _id: 0, date: 1, year: 1, type: 1, title: 1 })
      .order('year ASC,date ASC,type ASC,title ASC,_id ASC').page(page, pageSize).countSelect();
    return this.success(events);
  }
};
