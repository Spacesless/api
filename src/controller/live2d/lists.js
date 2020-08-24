const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  async indexAction() {
    const JSONpath = path.join(this.basePath, 'models.json');
    const modelJson = await fs.readJson(JSONpath);
    const modelLists = [];
    modelJson.forEach(item => {
      const { id, name, children } = item;
      let temp = [];
      if (!think.isEmpty(children)) {
        temp = children.map(childs => {
          const { id, name } = childs;
          return { id, name };
        });
      }
      modelLists.push({ id, name, children: temp });
    });
    return this.success(modelLists);
  }

  async modelAction() {
    const id = this.get('id') ? +this.get('id') : 0;
    const isMixins = this.get('mixins');
    const row = this.modelLists.find(item => item.id === id);
    let result = {};
    let modelDir;
    if (row) {
      if (!think.isArray(row.models)) {
        modelDir = path.join(this.basePath, row.models);
        const randomPath = path.join(modelDir, 'random_list.json');
        const switchPath = path.join(modelDir, 'switch_list.json');
        let texturesJson;
        if (+isMixins) {
          if (think.isExist(randomPath)) {
            texturesJson = await fs.readJson(randomPath);
          }
        } else {
          if (think.isExist(switchPath)) {
            texturesJson = await fs.readJson(switchPath);
          }
        }
        result = {
          id: row.id,
          name: row.name,
          message: row.message,
          from: row.from,
          total: texturesJson ? texturesJson.length : 0
        };
      } else {
        result = {
          id: row.id,
          name: row.name,
          message: row.message,
          from: row.from,
          total: row.models.length
        };
      }
    }
    return this.success(result);
  }
};
