const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  async indexAction() {
    const { keyword } = this.get();
    const garbages = await fs.readJson(path.join(think.ASSETS_PATH, 'garbage.json'));
    const filterGarbages = garbages.filter(item => item.name.includes(keyword));
    const categroysEnum = {
      1: '可回收物',
      2: '有害垃圾',
      4: '湿垃圾',
      8: '干垃圾',
      16: '大件垃圾'
    };
    const data = filterGarbages.map(item => {
      const { name, categroy } = item;
      return {
        name,
        categroy: categroysEnum[categroy]
      };
    });
    return this.success(data);
  }
};
