const Base = require('./base');

module.exports = class extends Base {
  // 根据id、材质id获取模型贴图文件、Moc、动作组、物理效果文件、姿势文件等信息
  async indexAction() {
    const id = +this.get('id');
    const texture = +this.get('texture');
    const result = await this.formatJson(id, texture);
    if (think.isEmpty(result)) return this.fail('没有找到模型或材质哟');
    else this.body = result;
  }
};
