const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  async indexAction() {
    const id = this.get('id') ? +this.get('id') : 10;
    const texture = this.get('texture') ? +this.get('texture') : 1;
    const isMixins = this.get('mixins');
    const result = await this.formatJson(id, texture, isMixins);
    if (think.isEmpty(result)) return this.fail('没有找到模型或材质哟');
    else this.body = result;
  }

  async switchAction() {
    const id = this.get('id') ? +this.get('id') : 10;
    const index = this.modelLists.findIndex(item => item.id === id);
    const next = this.modelLists[index + 1] || this.modelLists[0];
    const texture = 1;
    const result = await this.formatJson(next.id || 10, texture);
    if (think.isEmpty(result)) return this.fail('没有找到模型或材质哟');
    else this.success({id: next.id, message: next.message});
  }

  async randomAction() {
    const id = Math.ceil(Math.random() * this.modelLists.length);
    if (id === this.get('id')) return this.randomAction();
    const next = this.modelLists.find(item => item.id === id) || this.modelLists[0];
    const texture = 1;
    const result = await this.formatJson(id, texture);
    if (think.isEmpty(result)) return this.fail('没有找到模型或材质哟');
    else this.success({id: next.id, message: next.message});
  }

  async formatJson(id, texture, isMixins) {
    const row = this.modelLists.find(item => item.id === id);
    if (!row) return;
    let modelDir;
    let modelJson;
    if (!think.isArray(row.models)) {
      modelDir = path.join(this.basePath, row.models);
      modelJson = await fs.readJson(path.join(modelDir, 'model.json'));
      const textures = await this.getTextures(modelDir, texture, isMixins);
      if (think.isEmpty(textures)) return;
      modelJson.textures = textures;
    } else {
      if (!row.models[texture - 1]) return;
      modelDir = path.join(this.basePath, row.models[texture - 1]);
      modelJson = await fs.readJson(path.join(modelDir, 'model.json'));
      const textures = this.replaceUrl(modelDir + '/assets', 'textures');
      const texturesStr = JSON.stringify(modelJson.textures).replace(/textures/g, textures);
      modelJson.textures = JSON.parse(texturesStr);
    }
    modelJson.model = this.replaceUrl(modelDir, '') + modelJson.model;

    if (modelJson.pose) modelJson.pose = this.replaceUrl(modelDir, '') + modelJson.pose;
    if (modelJson.physics) modelJson.physics = this.replaceUrl(modelDir, '') + modelJson.physics;
    if (modelJson.sounds) modelJson.sounds = this.replaceUrl(modelDir, '') + modelJson.sounds;
    if (modelJson.motions) {
      const motions = this.replaceUrl(modelDir, 'motions/');
      const motionsStr = JSON.stringify(modelJson.motions);
      modelJson.motions = JSON.parse(motionsStr.replace(/motions\//g, motions));
    }
    if (modelJson.expressions) {
      const expressions = this.replaceUrl(modelDir, 'expressions/');
      const expressionsStr = JSON.stringify(modelJson.expressions);
      modelJson.expressions = JSON.parse(expressionsStr.replace(/motions\//g, expressions));
    }

    return modelJson;
  }
};
