const axios = require('axios');
const dayjs = require('dayjs');
const Base = require('./base');

module.exports = class extends Base {
  constructor(...args) {
    super(...args);
    this.modelInstance = this.mongo('english-sentence');
  }

  async indexAction() {
    const { date } = this.get();

    const targetDate = date || dayjs().format('YYYY-MM-DD');

    const record = await this.modelInstance.findRecord(targetDate);

    if (record) {
      return this.success(record);
    } else {
      this.fail('未找到对应记录');
    }
  }

  async randomAction() {
    const record = await this.modelInstance.randomRecord();

    if (record.length) {
      const firstRecord = record[0];
      return this.success(firstRecord);
    } else {
      this.fail('未找到对应记录');
    }
  }

  async listAction() {
    const { page, pageSize } = this.get();

    const list = await this.modelInstance.selectRecord(page, pageSize);

    this.success(list);
  }

  /**
   * 定时采集任务
   */
  async crontabAction() {
    const data = await axios({
      url: 'https://open.iciba.com/dsapi',
      methods: 'get',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0'
      }
    }).then(async res => {
      return res.data;
    }).catch(() => {});

    if (data) {
      const insertId = this.modelInstance.addRecord(data);
      think.logger.debug(data);
      if (insertId) {
        return this.success();
      } else {
        return this.fail();
      }
    }
    return this.fail();
  }
};
