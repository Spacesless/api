import type { BangumiItem, BangumiQuery } from '../types/bangumi';
import Base = require('./base');
import path = require('path');
import fs = require('fs-extra');

const basePath = path.join(think.ASSETS_PATH, 'bangumi');

export = class extends Base {
  /**
   * 根据年、月、标题(翻译标题)查找番组信息
   * @see https://github.com/bangumi-data/bangumi-data 数据来源
   *
   * @summary 动画番剧查询
   * @description 查询动画番组信息
   */
  async indexAction() {
    const { year, month, title } = this.getApiQuery<BangumiQuery>();

    const readJsonContent: { items: BangumiItem[] } = await fs.readJson(path.join(basePath, 'data.json'));
    const bangumis = readJsonContent ? readJsonContent.items : [];
    const data = bangumis.filter(item => {
      let includeYear = true; // 默认不进行筛选
      let includeMonth = true;
      let includeTitle = true;

      const beginTime = new Date(item.begin); // 筛选上映时间
      if (year) includeYear = beginTime.getFullYear() === +year;
      if (month) includeMonth = (beginTime.getMonth() + 1) === +month;

      if (title) includeTitle = item.title.includes(title) || JSON.stringify(item.titleTranslate).includes(title); // 筛选番剧的标题和翻译标题

      return includeYear && includeMonth && includeTitle;
    });

    return this.success(data);
  }
};
