import type { Live2dModelRandomQuery, Live2dModelSwitchQuery } from '../../types/live2d';
import Base = require('./base');

export = class extends Base {
  // 根据模型id、模式id获取下一材质id
  /**
   * @summary 顺序获取模型
   * @description 模型id通过列表可查
   */
  async switchAction() {
    const id = +this.getApiQuery<Live2dModelSwitchQuery>().id;
    const index = this.modelLists.findIndex(item => item.id === id);
    const next = this.modelLists[index + 1] || this.modelLists[0];

    if (think.isEmpty(next)) {
      return this.fail('没有找到模型哟');
    }

    const texture = 1;
    const result = await this.formatJson(next.id, texture);

    if (think.isEmpty(result)) {
      return this.fail('没有找到材质哟');
    } else {
      this.success({id: next.id, message: next.message});
    }
  }

  // 根据模型id随机获取一模型
  /**
   * @summary 随机获取模型
   * @description 模型id通过列表可查
   */
  async randomAction(): Promise<unknown> {
    const id = Math.ceil(Math.random() * this.modelLists.length);
    if (id === this.getApiQuery<Live2dModelRandomQuery>().id) return this.randomAction();
    const next = this.modelLists[id] || this.modelLists[0];
    const texture = 1;
    const result = await this.formatJson(next.id, texture);

    if (think.isEmpty(result)) {
      return this.fail('没有找到模型或材质哟');
    } else {
      this.success({id: next.id, message: next.message});
    }
  }
};
