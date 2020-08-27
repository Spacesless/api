const Base = require('../base');
const path = require('path');
const url = require('url');
const fs = require('fs-extra');

module.exports = class extends Base {
  async __before() {
    super.__before();
    this.basePath = path.join(think.ASSETS_PATH, '/model');
    this.modelLists = await this.getList();
    this.isSupportWebp = this.get('isSupportWebp');
  }

  async getList() {
    const JSONpath = path.join(this.basePath, 'models.json');
    const modelJson = await fs.readJson(JSONpath);
    let modelLists = [];
    modelJson.forEach(item => {
      if (think.isEmpty(item.children) && item.path) {
        modelLists.push(item);
      } else {
        const childs = item.children.map(child => child);
        modelLists = modelLists.concat(childs);
      }
    });
    return modelLists;
  }

  replaceUrl(source, target) {
    const relative = url.resolve(source.replace(this.basePath, '../model') + '/', target);
    return relative;
  }

  async getTextures(modelDir, texture) {
    const switchPath = path.join(modelDir, 'switch_list.json');
    let texturesJson;
    if (think.isExist(switchPath)) {
      texturesJson = await fs.readJson(switchPath);
    }
    const _textures = texturesJson ? texturesJson[texture - 1] : [];
    if (think.isArray(_textures)) {
      return _textures.map(item => {
        return this.replaceUrl(modelDir, `assets/${item}@.${this.isSupportWebp ? 'webp' : 'png'}`);
      });
    } else {
      return [this.replaceUrl(modelDir, `assets/${_textures}@.${this.isSupportWebp ? 'webp' : 'png'}`)];
    }
  }
};
