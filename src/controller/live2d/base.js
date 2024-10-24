const Base = require('../base');
const path = require('path');
const url = require('url');
const fs = require('fs-extra');

module.exports = class extends Base {
  async __before() {
    super.__before();
    this.basePath = path.join(think.ASSETS_PATH, 'live2d-assets');
    // 是否使用cdn加速，需客户端live2d支持http协议
    this.isuseCDN = this.get('isuseCDN');

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
    const targetPrefix = this.isuseCDN ? `//cos.timelessq.com/live2d-assets` : '../live2d-assets';
    const relative = url.resolve(prefix.replace(this.basePath, targetPrefix) + '/', suffix);
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

  /**
   * 格式化model.json
   * @param {Number [int]} id 模型id
   * @param {Number [int]} texture 模型材质
   */
  async formatJson(id, texture) {
    const row = this.modelLists.find(item => item.id === id);
    if (!row) return;
    let modelPath;
    let modelJson;
    let texturesList;

    // Textures 贴图文件
    if (!think.isArray(row.models)) {
      modelPath = path.join(this.basePath, row.models);
      modelJson = await fs.readJson(path.join(modelPath, 'model.json'));
      texturesList = await this.getTextures(modelPath, texture);
      if (think.isEmpty(texturesList)) return;
      modelJson.textures = texturesList;
    } else {
      const findModel = row.models[texture - 1];
      if (!findModel) return;
      modelPath = path.join(this.basePath, findModel);
      modelJson = await fs.readJson(path.join(modelPath, 'model.json'));
      modelJson.textures = await this.getTextures(modelPath, modelJson.textures);
    }

    // Moc
    modelJson.model = this.getAbsolutePath(modelPath) + modelJson.model;

    // Pose 姿势文件
    if (modelJson.pose) modelJson.pose = this.getAbsolutePath(modelPath) + modelJson.pose;

    // Physics 物理效果文件
    if (modelJson.physics) modelJson.physics = this.getAbsolutePath(modelPath) + modelJson.physics;

    // Sounds 音频文件
    if (modelJson.sounds) modelJson.sounds = this.getAbsolutePath(modelPath) + modelJson.sounds;

    // Motions 动作组
    if (modelJson.motions) {
      const motions = this.getAbsolutePath(modelPath, 'motions/');
      const motionsStr = JSON.stringify(modelJson.motions);
      modelJson.motions = JSON.parse(motionsStr.replace(/motions\//g, motions));
    }

    // Expressions 表情组
    if (modelJson.expressions) {
      const expressions = this.getAbsolutePath(modelPath, 'expressions/');
      const expressionsStr = JSON.stringify(modelJson.expressions);
      modelJson.expressions = JSON.parse(expressionsStr.replace(/motions\//g, expressions));
    }

    return modelJson;
  }
};
