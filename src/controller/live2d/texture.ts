import type { Live2dTextureRandomQuery, Live2dTextureSwitchQuery } from '../../types/live2d';
import Base = require('./base');
import path = require('path');
import fs = require('fs-extra');

export = class extends Base {
  // 根据模型id、模式id获取下一材质id
  /**
   * @summary 顺序获取材质
   * @description 模型id通过列表可查，材质id(1-材质总数范围内)
   */
  async switchAction() {
    const id = +this.getApiQuery<Live2dTextureSwitchQuery>().id;
    let _texture = +this.getApiQuery<Live2dTextureSwitchQuery>().texture;
    _texture += 1;
    const row = this.modelLists.find(item => item.id === id)!;

    let modelDir;
    let textures;
    if (!Array.isArray(row.models)) {
      modelDir = path.join(this.basePath, row.models);
      textures = await this.getTextures(modelDir, _texture);
    } else {
      modelDir = path.join(this.basePath, row.models[_texture - 1]);
      const modelJson = fs.readJson(path.join(modelDir, 'model.json'));

      if (think.isEmpty(modelJson)) {
        return this.fail('没有找到新衣服哟');
      }

      textures = this.getAbsolutePath(modelDir, 'textures');
    }

    return this.success({id, texture: think.isEmpty(textures) ? 0 : _texture});
  }

  // 根据模型id随机获取一材质
  /**
   * @summary 随机获取材质
   * @description 模型id通过列表可查
   */
  async randomAction(): Promise<unknown> {
    const id = +this.getApiQuery<Live2dTextureRandomQuery>().id;
    let _texture;
    const row = this.modelLists.find(item => item.id === id)!;

    let modelDir;
    let textures;
    if (!Array.isArray(row.models)) {
      modelDir = path.join(this.basePath, row.models);
      const texturesJson = await fs.readJson(path.join(modelDir, 'switch_list.json'));
      _texture = Math.ceil(Math.random() * texturesJson.length);

      if (_texture === this.get('texture')) {
        return this.randomAction();
      }

      textures = await this.getTextures(modelDir, _texture);
    } else {
      _texture = Math.ceil(Math.random() * row.models.length);

      if (_texture === this.get('texture')) {
        return this.randomAction();
      }

      modelDir = path.join(this.basePath, row.models[_texture - 1]);
      const modelJson = await fs.readJson(path.join(modelDir, 'model.json'));

      if (think.isEmpty(modelJson)) {
        return this.fail('没有找到新衣服哟');
      }

      textures = this.getAbsolutePath(modelDir, 'textures');
    }

    return this.success({id, texture: think.isEmpty(textures) ? 0 : _texture});
  }
};
