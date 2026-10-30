import type Model = require('../model/sentence');
import Base = require('./base');

export = class extends Base {
  declare modelInstance: InstanceType<typeof Model>;
  constructor(...args: ConstructorParameters<typeof Base>) {
    super(...args);
    this.modelInstance = this.mongo('sentence');
  }

  async indexAction() {
    const params = this.getApiQuery('/sentence');
    const record = await this.modelInstance.randomRecord(params);

    if (record.length) {
      const firstRecord = record[0];
      return this.success(firstRecord);
    } else {
      this.fail('未找到对应记录');
    }
  }

  async getAction() {
    const { id } = this.getApiQuery('/sentence/get');
    const record = await this.modelInstance.findRecord(id!);

    if (record) {
      return this.success(record);
    } else {
      this.fail('未找到对应记录');
    }
  }

  async listAction() {
    const params = this.getApiQuery('/sentence/list');

    const list = await this.modelInstance.selectRecord(params);

    this.success(list);
  }
};
