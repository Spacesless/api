const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

const categroysEnum = {
  1: '可回收物',
  2: '有害垃圾',
  4: '湿垃圾',
  8: '干垃圾',
  16: '大件垃圾'
};

module.exports = class extends Base {
  async indexAction() {
    const { keyword, categroy } = this.get();
    const garbages = await fs.readJson(path.join(think.ASSETS_PATH, 'garbage.json'));
    const filterGarbages = garbages.filter(item => {
      let isEqualCategroy = true;
      let includeKeyword = true;

      if (categroy) {
        const keys = Object.keys(categroysEnum);
        const values = Object.values(categroysEnum);
        const findIndex = values.findIndex(item => item === categroy);
        const categroyId = keys[findIndex];
        isEqualCategroy = item.categroy === +categroyId;
      }
      if (keyword) includeKeyword = item.name.includes(keyword);

      return isEqualCategroy && includeKeyword;
    });
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
