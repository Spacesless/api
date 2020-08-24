const Base = require('./base');
const path = require('path');
const xlsx = require('node-xlsx');
const fs = require('fs-extra');

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);
    this.postals = [];
  }

  async indexAction() {
    const { keyword } = this.get();
    const jsonPath = path.join(think.ASSETS_PATH, 'postalcode.json');
    const isExist = think.isExist(jsonPath);
    this.postals = isExist ? await fs.readJson(jsonPath) : this.formatToJson();
    const data = this.postals.filter(item => item.province.includes(keyword) || item.city.includes(keyword) || item.area.includes(keyword));
    return this.success(data);
  }

  formatToJson() {
    // 解析得到文档中的所有 sheet
    const sheets = xlsx.parse(path.join(think.ASSETS_PATH, '/xlsx', 'youbian.xlsx'));
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
    fs.writeJsonSync(path.join(think.ASSETS_PATH, 'postalcode.json'), temp);
    return temp;
  }
};
