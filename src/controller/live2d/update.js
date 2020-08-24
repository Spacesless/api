const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  indexAction() {
    this.modelLists.forEach(item => {
      const { models } = item;
      if (!think.isArray(models)) {
        const modelDir = path.join(this.basePath, models);
        if (think.isExist(modelDir)) {
          this.setTextures(modelDir);
        }
      }
    });
    this.body = '材质列表更新完成';
  }

  /**
   * 设置材质
   * @param {String} modelName 模型名称
   */
  async setTextures(modelName) {
    const orderPath = path.join(modelName, 'textures_order.json');
    let texturesList = [];
    const switchList = [];
    let randomList = [];
    if (think.isExist(orderPath)) {
      const orderList = await fs.readJson(orderPath);
      const { faceName, upperName, lowerName, headwearName } = orderList;

      const faceTextures = think.getdirFiles(path.join(modelName, faceName));
      const upperTextures = think.getdirFiles(path.join(modelName, upperName));
      const lowerTextures = think.getdirFiles(path.join(modelName, lowerName));
      const headwearTextures = think.getdirFiles(path.join(modelName, headwearName));
      const bodyTextures = upperTextures.map((item, index) => {
        return [`${upperName}/${item}`, `${lowerName}/${lowerTextures[index]}`];
      });

      // switch
      headwearTextures.forEach(headwear => {
        const name = headwear.split('-');
        name.pop();
        const target = name.join('-');
        const bodyIndex = upperTextures.findIndex(item => item.includes(target));
        switchList.push([`${faceName}/${faceTextures[0]}`, ...bodyTextures[bodyIndex], `${headwearName}/${headwear}`]);
      });
      const switchPath = path.join(modelName, 'switch_list.json');
      await fs.writeJson(switchPath, switchList);

      // random
      headwearTextures.forEach(headwear => {
        bodyTextures.forEach(body => {
          randomList.push([`${faceName}/${faceTextures[0]}`, ...body, `${headwearName}/${headwear}`]);
        });
      });
      const randomPath = path.join(modelName, 'random_list.json');
      await fs.writeJson(randomPath, randomList);
    } else {
      const modelJson = await fs.readJson(path.join(modelName, 'model.json'));
      const texturesDir = modelJson.textures[0].split('/')[0];
      texturesList = think.getdirFiles(path.join(modelName, texturesDir));
      randomList = texturesList.map(item => `${texturesDir}/${item}`);
      const switchPath = path.join(modelName, 'switch_list.json');
      await fs.writeJson(switchPath, randomList);
    }
  }
};
