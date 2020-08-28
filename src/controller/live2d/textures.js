const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  async switchAction() {
    const id = +this.get('id');
    let _texture = +this.get('texture');
    _texture += 1;
    const row = this.modelLists.find(item => item.id === id);
    let modelDir;
    let textures;
    if (!think.isArray(row.models)) {
      modelDir = path.join(this.basePath, row.models);
      textures = await this.getTextures(modelDir, _texture);
    } else {
      modelDir = path.join(this.basePath, row.models[_texture - 1]);
      const modelJson = fs.readJson(path.join(modelDir, 'model.json'));
      if (think.isEmpty(modelJson)) return this.fail('没有找到新衣服哟');
      textures = this.getAbsolutePath(modelDir, 'textures');
    }
    return this.success({id, texture: think.isEmpty(textures) ? 0 : _texture});
  }

  async randomAction() {
    const id = +this.get('id');
    let _texture;
    const row = this.modelLists.find(item => item.id === id);
    let modelDir;
    let textures;
    if (!think.isArray(row.models)) {
      modelDir = path.join(this.basePath, row.models);
      const texturesJson = await fs.readJson(path.join(modelDir, 'switch_list.json'));
      _texture = Math.ceil(Math.random() * texturesJson.length);
      if (_texture === this.get('texture')) return this.randomAction();
      textures = await this.getTextures(modelDir, _texture);
    } else {
      _texture = Math.ceil(Math.random() * row.models.length);
      if (_texture === this.get('texture')) return this.randomAction();
      modelDir = path.join(this.basePath, row.models[_texture - 1]);
      const modelJson = await fs.readJson(path.join(modelDir, 'model.json'));
      if (think.isEmpty(modelJson)) return this.fail('没有找到新衣服哟');
      textures = this.getAbsolutePath(modelDir, 'textures');
    }
    return this.success({id, texture: think.isEmpty(textures) ? 0 : _texture});
  }
};
