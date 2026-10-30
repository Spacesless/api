import type Model = require('../model/joke');
import Base = require('./base');

export = class extends Base {
  declare modelInstance: InstanceType<typeof Model>;
  constructor(...args: ConstructorParameters<typeof Base>) {
    super(...args);
    this.modelInstance = this.mongo('joke');
  }

  async indexAction() {
    const { type, level } = this.getApiQuery('/joke');

    const record = await this.modelInstance.randomRecord(type, level);

    if (record.length) {
      const firstRecord = record[0];
      return this.success(firstRecord);
    } else {
      this.fail('未找到对应记录');
    }
  }

  async listAction() {
    const params = this.getApiQuery('/joke/list');

    const list = await this.modelInstance.selectRecord(params);

    this.success(list);
  }
};
