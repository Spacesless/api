const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  async switchAction() {
    const id = +this.get('id') || 10;
    let _texture = +this.get('texture') || 0;
    const isMixins = this.get('mixins');
    _texture += 1;
    const row = this.modelLists.find(item => item.id === id);
    let modelDir;
    let textures;
    if (!think.isArray(row.models)) {
      modelDir = path.join(this.basePath, row.models);
      textures = await this.getTextures(modelDir, _texture, isMixins);
    } else {
      modelDir = path.join(this.basePath, row.models[_texture - 1]);
      const modelJson = fs.readJson(path.join(modelDir, 'model.json'));
      if (think.isEmpty(modelJson)) return this.fail('没有找到新衣服哟');
      textures = this.replaceUrl(modelDir, 'textures');
    }
    return this.success({id, texture: think.isEmpty(textures) ? 0 : _texture});
  }

  async randomAction() {
    const id = +this.get('id') || 10;
    const isMixins = this.get('mixins');
    let _texture;
    const row = this.modelLists.find(item => item.id === id);
    let modelDir;
    let textures;
    if (!think.isArray(row.models)) {
      modelDir = path.join(this.basePath, row.models);
      const texturesJson = +isMixins
        ? await fs.readJson(path.join(modelDir, 'random_list.json'))
        : await fs.readJson(path.join(modelDir, 'switch_list.json'));
      _texture = Math.ceil(Math.random() * texturesJson.length);
      if (_texture === this.get('texture')) return this.randomAction();
      textures = await this.getTextures(modelDir, _texture, isMixins);
    } else {
      _texture = Math.ceil(Math.random() * row.models.length);
      if (_texture === this.get('texture')) return this.randomAction();
      modelDir = path.join(this.basePath, row.models[_texture - 1]);
      const modelJson = await fs.readJson(path.join(modelDir, 'model.json'));
      if (think.isEmpty(modelJson)) return this.fail('没有找到新衣服哟');
      textures = this.replaceUrl(modelDir, 'textures');
    }
    return this.success({id, texture: think.isEmpty(textures) ? 0 : _texture});
  }
};
