const Base = require('./base');

module.exports = class extends Base {
  constructor(...args) {
    super(...args);
    this.modelInstance = this.mongo('sentence');
  }

  async indexAction() {
    const params = this.get();
    const record = await this.modelInstance.randomRecord(params);

    if (record.length) {
      const firstRecord = record[0];
      return this.success(firstRecord);
    } else {
      this.fail('未找到对应记录');
    }
  }

  async getAction() {
    const { id } = this.get();
    const record = await this.modelInstance.findRecord(id);

    if (record) {
      return this.success(record);
    } else {
      this.fail('未找到对应记录');
    }
  }

  async listAction() {
    const params = this.get();

    const list = await this.modelInstance.selectRecord(params);

    this.success(list);
  }
};
