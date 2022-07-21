const axios = require('axios');
const moment = require('moment');
const Base = require('../base');

const bingApi = 'https://cn.bing.com/HPImageArchive.aspx';
const baseUrl = 'https://cn.bing.com';

module.exports = class extends Base {
  constructor(...args) {
    super(...args);
    this.modelInstance = this.model('image/bing');
  }

  async indexAction() {
    const { date, format } = this.get();

    const targetDate = date || moment().format('YYYY-MM-DD');

    const record = await this.modelInstance.findRecord(targetDate);

    if (record.url) {
      record.url = baseUrl + record.url;

      if (format === 'json') {
        return this.success(record);
      } else {
        this.ctx.redirect(record.url);
      }
    } else {
      this.fail('未找到对应记录');
    }
  }

  async randomAction() {
    const { format } = this.get();

    const record = await this.modelInstance.randomRecord();

    if (record.length) {
      const firstRecord = record[0];
      firstRecord.url = baseUrl + firstRecord.url;
      if (format === 'json') {
        return this.success(firstRecord);
      } else {
        this.ctx.redirect(firstRecord.url);
      }
    } else {
      this.fail('未找到对应记录');
    }
  }

  async listAction() {
    const { page, pageSize } = this.get();

    const list = await this.modelInstance.selectRecord(page, pageSize);

    this.success(list);
  }

  crontabAction() {
    if (!this.isCli) {
      return this.fail(1000, 'deny');
    }

    axios({
      url: bingApi,
      methods: 'get',
      params: {
        idx: 0,
        n: 1,
        format: 'js',
        mkt: 'zh-CN'
      }
    }).then(res => {
      const { images } = res.data || {};
      if (images[0]) {
        this.modelInstance.addRecord(images[0]);
      }
    });
  }
};
