const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');
const { zip } = require('lodash/array');

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);

    this.contextBody = [];
  }

  async indexAction() {
    this.writeDocument('开始更新材质列表');
    for (const item of this.modelLists) {
      const { models } = item;
      if (!think.isArray(models)) { // 模型不是数组的才需要读写列表
        const modelPath = path.join(this.basePath, models);
        if (think.isExist(modelPath)) {
          this.writeDocument('正在更新' + models);
          await this.writeTexturesList(modelPath);
        }
      }
    }
    this.writeDocument('材质列表更新完成');
  }

  /**
   * 存储材质列表
   * @param {String} modelPath 模型地址
   */
  async writeTexturesList(modelPath) {
    let switchList = [];

    const orderPath = path.join(modelPath, 'textures_order.json');
    const switchPath = path.join(modelPath, 'switch_list.json');
    // bilibili有textures_order可以搭配的情况
    if (think.isExist(orderPath)) {
      const orderList = await fs.readJson(orderPath);

      let singleTextures = [];
      let zipTextures = [];
      orderList.forEach(item => {
        if (think.isArray(item)) {
          item.forEach(child => {
            const textures = think.getdirFiles(path.join(modelPath, child)).map(path => `${child}/${path}`);
            zipTextures.push(textures);
          });
        } else {
          const textures = think.getdirFiles(path.join(modelPath, item)).map(path => `${item}/${path}`);
          singleTextures = [...singleTextures, ...textures];
        }
      });

      zipTextures = zip(...zipTextures);
      switchList = zipTextures.map(item => {
        return [...singleTextures, ...item];
      });

      await fs.writeJson(switchPath, switchList);
    } else {
      const modelJson = await fs.readJson(path.join(modelPath, 'model.json'));
      const texturesDir = modelJson.textures[0].split('/')[0];
      const fileList = think.getdirFiles(path.join(modelPath, texturesDir));
      switchList = fileList.map(item => `${texturesDir}/${item}`);
      await fs.writeJson(switchPath, switchList);
    }
  }

  /**
   * 输出信息到前台
   * @param {String} content
   */
  writeDocument(content) {
    this.contextBody.push(content + '\n');
    this.body = this.contextBody.join('');
  }
};
