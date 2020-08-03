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
};
