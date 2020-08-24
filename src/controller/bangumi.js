const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);
    this.baseurl = path.join(think.ROOT_PATH, 'www/bangumi');
  }

  async indexAction() {
    const { year, month, title } = this.get();
    let data = [];

    if (year && month) {
      const formatMonth = +month < 10 ? '0' + month : month;
      const jsonPath = path.join(this.baseurl, `items/${year}/${formatMonth}.json`);
      const isExist = think.isExist(jsonPath);
      if (isExist) {
        const bangumis = await fs.readJson(jsonPath);
        data = title
          ? bangumis.filter(item => {
            return item.title.includes(title) || JSON.stringify(item.titleTranslate).includes(title);
          })
          : bangumis;
      }
    } else {
      const readJsonContent = await fs.readJson(path.join(this.baseurl, 'data.json'));
      const bangumis = readJsonContent ? readJsonContent.items : [];
      data = title
        ? bangumis.filter(item => {
          const hasYear = year ? new Date(item.begin).getFullYear() === +year : true;
          return (item.title.includes(title) || JSON.stringify(item.titleTranslate).includes(title)) && hasYear;
        })
        : bangumis.filter(item => {
          const hasYear = year ? new Date(item.begin).getFullYear() === +year : true;
          return hasYear;
        });
    }

    return this.success(data);
  }
};
