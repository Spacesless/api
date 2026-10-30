import type { Live2dGetQuery } from '../../types/live2d';
import Base = require('./base');

export = class extends Base {
  // 根据id、材质id获取模型贴图文件、Moc、动作组、物理效果文件、姿势文件等信息
  /**
   * @summary 模型信息
   * @description 模型id通过模型列表可查，材质id(1-材质总数范围内，模型列表的total字段)
   * 也可以查看这里：https://www.timelessq.com/tool/live2d
   */
  async indexAction() {
    const id = +this.getApiQuery<Live2dGetQuery>().id;
    const texture = +this.getApiQuery<Live2dGetQuery>().texture;
    const result = await this.formatJson(id, texture);
    if (think.isEmpty(result)) {
      return this.fail('没有找到模型或材质哟');
    } else {
      this.body = result;
    }
  }
};
