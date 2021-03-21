const Base = require('./base');
const path = require('path');
const url = require('url');
const fs = require('fs-extra');

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);
    this.basePath = path.join(think.ASSETS_PATH, 'SD');
  }

  // 通过SD小人id获取skeleton、atlas、texture地址
  async indexAction() {
    const { id, isuseCDN } = this.get();
    const sdPath = path.join(this.basePath, id);
    if (think.isExist(sdPath)) {
      const prefix = isuseCDN === 'true' ? this.CDNDomain : this.ctx.origin.replace(/http:|https:/, '');
      const binaryPath = path.join(sdPath, `${id}.skel`);
      const jsonPath = path.join(sdPath, `${id}.json`);
      const atlasPath = path.join(sdPath, `${id}.atlas`);
      const texturePath = path.join(sdPath, `${id}.png`);
      const result = {
        atlas: think.isExist(atlasPath) ? url.resolve(prefix, atlasPath.replace(think.ASSETS_PATH, '')) : '',
        texture: think.isExist(texturePath) ? url.resolve(prefix, texturePath.replace(think.ASSETS_PATH, '')) : ''
      };
      // skel格式的skeleton
      if (think.isExist(binaryPath)) {
        result.skelBinary = url.resolve(prefix, binaryPath.replace(think.ASSETS_PATH, ''));
      }
      // json格式的skeleton
      if (think.isExist(jsonPath)) {
        result.skelJson = url.resolve(prefix, jsonPath.replace(think.ASSETS_PATH, ''));
      }
      return this.success(result);
    } else {
      return this.fail('This id is no exist');
    }
  }

  async listsAction() {
    const spineList = await fs.readJSON(path.join(this.basePath, '../spine.json'));
    return this.success(spineList);
  }
};
