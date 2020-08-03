const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  switchAction() {
    const id = +this.get('id') || 10;
    let texture = +this.get('texture') || 0;
    texture += 1;
    const row = this.modelLists.find(item => item.id === id);
    let modelDir;
    let textures;
    if (!think.isArray(row.models)) {
      modelDir = path.join(this.basePath, 'model/', row.models);
      textures = this.getTextures(modelDir, texture);
    } else {
      modelDir = path.join(this.basePath, 'model/', row.models[texture - 1]);
      const modelJson = fs.readJsonSync(path.join(modelDir, 'model.json'));
      if (think.isEmpty(modelJson)) return this.fail('没有找到材质哟');
      textures = this.replaceUrl(modelDir, 'textures');
      textures = JSON.parse(JSON.stringify(modelJson.textures).replace(/textures/g, textures));
    }
    this.body = textures;
  }

  randomAction() {
    const id = +this.get('id') || 10;
    const row = this.modelLists.find(item => item.id === id);
    let modelDir;
    let textures;
    if (!think.isArray(row.models)) {
      modelDir = path.join(this.basePath, 'model/', row.models);
      const texturesJson = fs.readJsonSync(path.join(modelDir, 'textures_list.json'));
      const texture = Math.ceil(Math.random() * texturesJson.length);
      textures = this.getTextures(modelDir, texture);
    } else {
      const texture = Math.ceil(Math.random() * row.models.length);
      modelDir = path.join(this.basePath, 'model/', row.models[texture - 1]);
      const modelJson = fs.readJsonSync(path.join(modelDir, 'model.json'));
      if (think.isEmpty(modelJson)) return this.fail('没有找到材质哟');
      textures = this.replaceUrl(modelDir, 'textures');
      textures = JSON.parse(JSON.stringify(modelJson.textures).replace(/textures/g, textures));
    }
    this.body = textures;
  }
};
