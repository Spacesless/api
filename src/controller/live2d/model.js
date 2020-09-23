const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  // 根据id、材质id获取模型贴图文件、Moc、动作组、物理效果文件、姿势文件等信息
  async indexAction() {
    const id = +this.get('id');
    const texture = +this.get('texture');
    const result = await this.formatJson(id, texture);
    if (think.isEmpty(result)) return this.fail('没有找到模型或材质哟');
    else this.body = result;
  }

  // 根据模型id、模式id获取下一材质id
  async switchAction() {
    const id = +this.get('id');
    const index = this.modelLists.findIndex(item => item.id === id);
    const next = this.modelLists[index + 1] || this.modelLists[0];
    if (think.isEmpty(next)) return this.fail('没有找到模型哟');
    const texture = 1;
    const result = await this.formatJson(next.id, texture);
    if (think.isEmpty(result)) return this.fail('没有找到材质哟');
    else this.success({id: next.id, message: next.message});
  }

  // 根据模型id随机获取一模型
  async randomAction() {
    const id = Math.ceil(Math.random() * this.modelLists.length);
    if (id === this.get('id')) return this.randomAction();
    const next = this.modelLists[id] || this.modelLists[0];
    const texture = 1;
    const result = await this.formatJson(next.id, texture);
    if (think.isEmpty(result)) return this.fail('没有找到模型或材质哟');
    else this.success({id: next.id, message: next.message});
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
