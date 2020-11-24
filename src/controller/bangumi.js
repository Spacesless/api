const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);
    this.basePath = path.join(think.ASSETS_PATH, 'bangumi');
  }

  /**
   * 根据年、月、标题(翻译标题)查找番组信息
   * @see https://github.com/bangumi-data/bangumi-data 数据来源
   */
  async indexAction() {
    const { year, month, title } = this.get();
    let data = [];

    const readJsonContent = await fs.readJson(path.join(this.basePath, 'data.json'));
    const bangumis = readJsonContent ? readJsonContent.items : [];
    data = bangumis.filter(item => {
      let includeYear = true;
      let includeMonth = true;
      let includeTitle = true;

      const beginTime = new Date(item.begin);
      if (year) includeYear = beginTime.getFullYear() === +year;
      if (month) includeMonth = (beginTime.getMonth() + 1) === +month;
      if (title) includeTitle = item.title.includes(title) || JSON.stringify(item.titleTranslate).includes(title);
      return includeYear && includeMonth && includeTitle;
    });

    return this.success(data);
  }
};
