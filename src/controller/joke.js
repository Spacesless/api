const Base = require('./base');

module.exports = class extends Base {
  constructor(...args) {
    super(...args);
    this.modelInstance = this.mongo('joke');
  }

  async indexAction() {
    const { type, level } = this.get();

    const record = await this.modelInstance.randomRecord(type, level);

    if (record.length) {
      const firstRecord = record[0];
      return this.success(firstRecord);
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
