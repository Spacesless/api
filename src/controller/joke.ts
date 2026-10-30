import type { JokeListQuery, JokeQuery } from '../types/joke';
import type Model = require('../model/joke');
import Base = require('./base');

export = class extends Base {
  declare modelInstance: InstanceType<typeof Model>;
  constructor(...args: ConstructorParameters<typeof Base>) {
    super(...args);
    this.modelInstance = this.mongo('joke');
  }

  /**
   * @summary 随机笑话
   * @description 随机返回一个笑话。
   */
  async indexAction() {
    const { type, level } = this.getApiQuery<JokeQuery>();

    const record = await this.modelInstance.randomRecord(type, level);

    if (record.length) {
      const firstRecord = record[0];
      return this.success(firstRecord);
    } else {
      this.fail('未找到对应记录');
    }
  }

  /**
   * @summary 笑话列表
   */
  async listAction() {
    const params = this.getApiQuery<JokeListQuery>();

    const list = await this.modelInstance.selectRecord(params);

    this.success(list);
  }
};
