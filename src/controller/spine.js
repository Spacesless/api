const Base = require('./base');
const path = require('path');
const url = require('url');
const fs = require('fs-extra');

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);
    this.baseurl = path.join(think.ASSETS_PATH, 'SD');
  }

  // 通过SD小人id获取skeleton、atlas、texture地址
  async indexAction() {
    const { id, isuseCDN } = this.get();
    const sdPath = path.join(this.baseurl, id);
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
        result.skeletonBinary = url.resolve(prefix, binaryPath.replace(think.ASSETS_PATH, ''));
      }
      // json格式的skeleton
      if (think.isExist(jsonPath)) {
        result.skeletonJson = url.resolve(prefix, jsonPath.replace(think.ASSETS_PATH, ''));
      }
      return this.success(result);
    } else {
      return this.fail('This id is no exist');
    }
  }

  // 获取SD小人列表，瓜游用拼音命名...
  async shipsAction() {
    const { name, hullType, nationality, rarity, retrofit } = this.get();
    const spineList = await fs.readJSON(path.join(this.baseurl, '../spine.json'));
    const targetList = spineList.filter(item => {
      let includeName = true;
      let includeHullType = true;
      let includeNationality = true;
      let includeRarity = true;
      let includeRetrofit = true;

      if (name) includeName = JSON.stringify(item.names).includes(name);
      if (hullType) includeHullType = item.hullType === hullType;
      if (nationality) includeNationality = item.nationality === nationality;
      if (rarity) includeRarity = item.rarity === rarity;
      if (retrofit) includeRetrofit = retrofit === 'true';

      return includeName && includeHullType && includeNationality && includeRarity && includeRetrofit;
    });

    return this.success(targetList);
  }

  async listsAction() {
    const spineList = await fs.readJSON(path.join(this.baseurl, '../spine.json'));
    let targetList = [];
    spineList.forEach(item => {
      const rows = item.skins.map(skin => {
        return {
          name: skin.name,
          value: skin.spineId
        };
      });
      targetList = [...targetList, ...rows];
    });

    return this.success(targetList);
  }
};
