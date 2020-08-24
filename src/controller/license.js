const Base = require('./base');
const path = require('path');
const xlsx = require('node-xlsx');
const fs = require('fs-extra');

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);
    this.baseurl = path.join(think.ROOT_PATH, 'www');
    this.licenses = [];
  }

  async __before() {
    super.__before();
    const jsonPath = path.join(this.baseurl, 'license.json');
    const isExist = think.isExist(jsonPath);
    this.licenses = isExist ? await fs.readJson(jsonPath) : this.formatToJson();
  }

  indexAction() {
    const { keyword } = this.get();
    const data = this.licenses.filter(item => JSON.stringify(item).includes(keyword));
    return this.success(data);
  }

  formatToJson() {
    // 解析得到文档中的所有 sheet
    const sheets = xlsx.parse(path.join(this.baseurl, 'xlsx', 'chepaihao.xlsx'));
    const temp = [];
    // 遍历 sheet
    sheets.forEach(sheet => {
      // 读取每行内容
      for (const key in sheet['data']) {
        if (+key === 0) continue;
        const headers = sheet['data'][0];
        const rows = sheet['data'][key];
        const format = {};
        rows.forEach((item, index) => {
          format[headers[index]] = item;
        });
        temp.push(format);
      }
    });
    fs.writeJsonSync(path.join(this.baseurl, 'license.json'), temp);
    return temp;
  }
};
