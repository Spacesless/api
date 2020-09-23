const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  // 根据id、材质id获取模型贴图文件、Moc、动作组、物理效果文件、姿势文件等信息
  async indexAction() {
    const id = +this.get('id');
    const texture = +this.get('texture');
    const result = await this.formatJson(id, texture);
    if (think.isEmpty(result)) return this.fail('没有找到模型或材质哟');
    else this.body = result;
  }

  // 模型列表 id、数量
  async listAction() {
    const JSONpath = path.join(this.basePath, 'models.json');
    const modelJson = await fs.readJson(JSONpath);
    const modelLists = [];
    for (const item of modelJson) {
      const { id, name, children } = item;
      const temp = [];
      if (!think.isEmpty(children)) {
        for (const child of children) {
          const { id, name, models, message, from } = child;
          let total;
          if (think.isArray(models)) {
            total = models.length;
          } else {
            const modelDir = path.join(this.basePath, models);
            const switchPath = path.join(modelDir, 'switch_list.json');
            if (think.isExist(switchPath)) {
              const texturesJson = await fs.readJson(switchPath);
              total = texturesJson ? texturesJson.length : 0;
            }
          }
          temp.push({ id, name, message, from, total });
        }
      }
      modelLists.push({ id, name, children: temp });
    }
    return this.success(modelLists);
  }
};
