const Base = require('../base');
const path = require('path');
const url = require('url');
const fs = require('fs-extra');

module.exports = class extends Base {
  __before() {
    super.__before();
    this.basePath = path.join(think.ROOT_PATH, '/www/model');
    this.modelLists = this.getList();
  }

  async getList() {
    const JSONpath = path.join(this.basePath, 'models.json');
    const modelJson = await fs.readJson(JSONpath);
    let modelLists = [];
    modelJson.forEach(item => {
      if (think.isEmpty(item.children) && item.path) {
        const { id, name, models } = item;
        modelLists.push({ id, name, models });
      } else {
        const childs = item.children.map(child => {
          const { id, name, models } = child;
          return { id, name, models };
        });
        modelLists = modelLists.concat(childs);
      }
    });
    return modelLists;
  }

  replaceUrl(source, target) {
    const relative = url.resolve(source.replace(this.basePath, '../model') + '/', target);
    return relative;
    // return `http://cos.timelessq.com${relative}`;
  }

  async getTextures(modelDir, texture) {
    const texturesJson = await fs.readJson(path.join(modelDir, 'textures_list.json'));
    let _textures = texturesJson[texture - 1] || [];
    if (think.isArray(_textures)) {
      return _textures.map(item => {
        item = this.ctx.isSuportWebp ? item.replace('.png', '.webp') : item;
        return this.replaceUrl(modelDir, `assets/${item}`);
      });
    } else {
      _textures = this.ctx.isSuportWebp ? _textures.replace('.png', '.webp') : _textures;
      return this.replaceUrl(modelDir, `assets/${_textures}`);
    }
  }
};
