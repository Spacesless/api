const Base = require('../base');
const path = require('path');
const url = require('url');
const fs = require('fs-extra');

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);
    this.basePath = path.join(think.ASSETS_PATH, 'azurlane-assets');
  }

  // 通过SD小人id获取skeleton、atlas、texture地址
  async indexAction() {
    const { id, isuseCDN } = this.get();
    const sdPath = path.join(this.basePath, 'spine', id);
    if (think.isExist(sdPath)) {
      const prefix = isuseCDN ? '//cos.timelessq.com' : this.ctx.origin.replace(/http:|https:/, '');
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
    const spineList = await fs.readJSON(path.join(this.basePath, 'spine-list.json'));
    return this.success(spineList);
  }

  async updateAction() {
    const listPath = path.join(this.basePath, 'spine-list.json');
    if (think.isExist(listPath)) {
      return this.success();
    }

    const ships = await fs.readJSON(path.join(this.basePath, 'ships.json'));
    const skins = await fs.readJSON(path.join(this.basePath, 'ship_skin_template.json'));

    const textures = fs.readdirSync(path.join(this.basePath, 'spine'));

    const map = {
      undefined: '',
      g: '改',
      h: '誓约',
      idol: undefined,
      younv: undefined,
      alter: undefined
    };

    const result = textures.map(item => {
      const findSkin = Object.values(skins).find(shin => shin.painting.toLowerCase() === item.toLowerCase());
      let findShip;
      if (findSkin) findShip = ships.find(ship => ship._gid === findSkin.ship_group);
      const skinName = findSkin ? findSkin.name : null;
      const nameSuffix = item.split('_')[1];
      const remark = skinName && skinName.includes('namecode') ? map[nameSuffix] : skinName;
      return {
        'name': findShip ? findShip.names.cn : (findSkin ? findSkin.name : null),
        'value': item,
        'remark': remark || undefined
      };
    });

    fs.writeJsonSync(listPath, result.filter(item => Boolean(item.name)), { spaces: 2 });

    this.success(result.filter(item => !item.name));
  }
};
