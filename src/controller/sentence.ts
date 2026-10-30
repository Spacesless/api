import type { SentenceGetQuery, SentenceListQuery, SentenceQuery } from '../types/sentence';
import type Model = require('../model/sentence');
import Base = require('./base');

export = class extends Base {
  declare modelInstance: InstanceType<typeof Model>;
  constructor(...args: ConstructorParameters<typeof Base>) {
    super(...args);
    this.modelInstance = this.mongo('sentence');
  }

  /**
   * @summary 随机获取句子
   * @description - 动漫也好、小说也好、网络也好，不论在哪里，我们总会看到有那么一两个句子能穿透你的心。
   * - 简单来说，一言指的就是一句话，可以是动漫中的台词，也可以是网络上的各种小段子。 或是感动，或是开心，有或是单纯的回忆。
   * - 基于https://hitokoto.cn/实现
   */
  async indexAction() {
    const params = this.getApiQuery<SentenceQuery>();
    const record = await this.modelInstance.randomRecord(params);

    if (record.length) {
      const firstRecord = record[0];
      return this.success(firstRecord);
    } else {
      this.fail('未找到对应记录');
    }
  }

  /**
   * @summary 句子详情
   */
  async getAction() {
    const { id } = this.getApiQuery<SentenceGetQuery>();
    const record = await this.modelInstance.findRecord(id!);

    if (record) {
      return this.success(record);
    } else {
      this.fail('未找到对应记录');
    }
  }

  /**
   * @summary 句子列表
   */
  async listAction() {
    const params = this.getApiQuery<SentenceListQuery>();

    const list = await this.modelInstance.selectRecord(params);

    this.success(list);
  }
};
