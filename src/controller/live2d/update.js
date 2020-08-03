const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  indexAction() {
    this.modelLists.forEach(item => {
      const { models } = item;
      if (!think.isArray(models)) {
        const modelDir = path.join(this.basePath, models);
        if (fs.statSync(modelDir)) {
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
  setTextures(modelName) {
    const listPath = path.join(modelName, 'textures_list.json');
    if (think.isExist(listPath)) return;
    const orderPath = path.join(modelName, 'textures_order.json');
    let texturesList = [];
    let result = [];
    if (think.isExist(orderPath)) {
      const order = fs.readJsonSync(orderPath);
      order.forEach(texturesDir => {
        let files = think.getdirFiles(path.join(modelName, texturesDir));
        files = files.map(item => {
          return `${texturesDir}/${item}`;
        });
        texturesList.push(files);
      });
      for (let i = 0; i < texturesList[3].length; i++) {
        texturesList[1].forEach((item, index) => {
          result.push([texturesList[0][0], item, texturesList[2][index], texturesList[3][i]]);
        });
      }
    } else {
      const modelJson = fs.readJsonSync(path.join(modelName, 'model.json'));
      const texturesDir = modelJson.textures[0].split('/')[0];
      texturesList = think.getdirFiles(path.join(modelName, texturesDir));
      result = texturesList.map(item => {
        return `${texturesDir}/${item}`;
      });
    }
    return fs.writeJsonSync(listPath, result);
  }

  convertWebp(modelName) {
    const orderPath = path.join(modelName, '/textures_order.json');
    if (think.isExist(orderPath)) {
      const order = fs.readJsonSync(orderPath);
      order.forEach(texturesDir => {
        let files = think.getdirFiles(path.join(modelName, texturesDir));
        files = files.map(item => {
          return `${texturesDir}/${item}`;
        });
        files.forEach(async(item) => {
          const src = path.join(modelName, item);
          const dest = path.join(modelName, 'assets/', path.dirname(item), path.basename(src, '.png') + '.webp');
          await think.sharpFormat(src, dest);
        });
      });
    } else {
      const modelJson = fs.readJsonSync(path.join(modelName, 'model.json'));
      const texturesDir = modelJson.textures[0].split('/')[0];
      const files = think.getdirFiles(path.join(modelName, texturesDir));
      files.forEach(async(item) => {
        item = `${texturesDir}/${item}`;
        const src = path.join(modelName, item);
        const dest = path.join(modelName, 'assets/', path.dirname(item), path.basename(src, '.png') + '.webp');
        await think.sharpFormat(src, dest);
      });
    }
  }
};
