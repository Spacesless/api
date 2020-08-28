const Base = require('../base');
const path = require('path');
const url = require('url');
const fs = require('fs-extra');

module.exports = class extends Base {
  async __before() {
    super.__before();
    this.basePath = path.join(think.ASSETS_PATH, '/model');
    this.modelLists = await this.getModelList();
  }

  // 获取模型列表
  async getModelList() {
    const JSONpath = path.join(this.basePath, 'models.json');
    const modelJson = await fs.readJson(JSONpath);
    let modelLists = [];
    modelJson.forEach(item => {
      if (think.isEmpty(item.children) && item.path) {
        modelLists.push(item);
      } else {
        const childs = item.children.map(child => child);
        modelLists = [ ...modelLists, ...childs ];
      }
    });
    return modelLists;
  }

  /**
   * 获取绝对地址
   * @param {String} prefix
   * @param {String} suffix
   */
  getAbsolutePath(prefix, suffix = '') {
    const relative = url.resolve(prefix.replace(this.basePath, '../model') + '/', suffix);
    return relative;
  }

  /**
   * 获取材质地址
   * @param {String} modelPath 模型目录
   * @param {*} texture
   * @returns {Array}
   */
  async getTextures(modelPath, texture) {
    if (think.isArray(texture)) {
      const texturesPath = this.getAbsolutePath(modelPath, 'textures');
      const texturesStr = JSON.stringify(texture).replace(/textures/g, texturesPath);
      return JSON.parse(texturesStr);
    } else {
      const switchPath = path.join(modelPath, 'switch_list.json');
      let texturesJson;
      if (think.isExist(switchPath)) {
        texturesJson = await fs.readJson(switchPath);
      }
      const _textures = texturesJson ? texturesJson[texture - 1] : [];
      if (!_textures) return; // 没有找到材质
      if (think.isArray(_textures)) {
        return _textures.map(item => {
          return this.getAbsolutePath(modelPath, `${item}`);
        });
      } else {
        return [this.getAbsolutePath(modelPath, `${_textures}`)];
      }
    }
  }
};
