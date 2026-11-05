import type { AzurlaneSpineQuery, SpineListItem, SpineResult } from '../../types/azurlane';
import Base = require('../base');
import path = require('path');
import url = require('url');
import fs = require('fs-extra');

export = class extends Base {
  declare basePath: string;
  constructor(...arg: ConstructorParameters<typeof Base>) {
    super(...arg);
    this.basePath = path.join(think.ASSETS_PATH, 'azurlane-assets');
  }

  // 通过SD小人id获取skeleton、atlas、texture地址
  /**
   * @summary Spine模型信息
   * @description SD动画小人模型资源信息
   */
  async indexAction() {
    const { id, isuseCDN } = this.getApiQuery<AzurlaneSpineQuery>();
    const sdPath = path.join(this.basePath, 'spine', id);
    if (think.isExist(sdPath)) {
      const prefix = isuseCDN ? '//cos.timelessq.com' : this.ctx.origin.replace(/http:|https:/, '');
      const binaryPath = path.join(sdPath, `${id}.skel`);
      const jsonPath = path.join(sdPath, `${id}.json`);
      const atlasPath = path.join(sdPath, `${id}.atlas`);
      const texturePath = path.join(sdPath, `${id}.png`);
      const result: SpineResult = {
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

  /**
   * @summary Spine模型列表
   * @description SD动画小人，可爱捏
   */
  async listsAction() {
    const spineList: SpineListItem[] = await fs.readJSON(path.join(this.basePath, 'spine-list.json'));
    return this.success(spineList);
  }
};
