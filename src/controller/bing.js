const axios = require('axios');
const dayjs = require('dayjs');
const Base = require('./base');

const bingApi = 'https://cn.bing.com/HPImageArchive.aspx';
const bingUrl = 'https://cn.bing.com';

module.exports = class extends Base {
  constructor(...args) {
    super(...args);
    this.modelInstance = this.mongo('bing');
  }

  async indexAction() {
    const { date, format, size = 'default' } = this.get();

    const targetDate = date || dayjs().format('YYYY-MM-DD');

    const record = await this.modelInstance.findRecord(targetDate);

    if (record.urlbase) {
      record.url = this.getAbsoluteUrl(record.urlbase, size);

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
    const { format, size = 'default' } = this.get();

    const record = await this.modelInstance.randomRecord();

    if (record.length) {
      const firstRecord = record[0];
      firstRecord.url = this.getAbsoluteUrl(firstRecord.urlbase, size);
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
    const { page, pageSize, size = 'default' } = this.get();

    const list = await this.modelInstance.selectRecord(page, pageSize);

    list.data.forEach(item => {
      item.url = this.getAbsoluteUrl(item.urlbase, size);
    });

    this.success(list);
  }

  /**
   * 定时采集任务
   */
  async crontabAction() {
    const data = await axios({
      url: bingApi,
      methods: 'get',
      params: {
        idx: 0,
        n: 1,
        format: 'js',
        mkt: 'zh-CN'
      }
    }).then(res => {
      return res.data;
    }).catch(() => {});

    const { images } = data || {};
    if (images[0]) {
      const insertId = this.modelInstance.addRecord(images[0]);
      think.logger.debug(images[0]);
      if (insertId) {
        return this.success();
      } else {
        return this.fail();
      }
    }
    return this.fail();
  }

  /**
   * 获取不同分辨率的图片
   * @param {String} urlBase 图片id
   * @param {String} size 图片尺寸
   */
  getAbsoluteUrl(urlBase, size) {
    let suffix = '';
    switch (size) {
      case 'mobile-mini':
        suffix = '240x400';
        break;
      case 'mobile-small':
        suffix = '480x800';
        break;
      case 'mobile-middle':
        suffix = '720x1280';
        break;
      case 'mobile-default':
        suffix = '1080x1920';
        break;
      case 'mini':
        suffix = '400x240';
        break;
      case 'small':
        suffix = '640x480';
        break;
      case 'middle':
        suffix = '1366x768';
        break;
      case 'large':
        suffix = 'UHD';
        break;
      default:
        suffix = '1920x1080';
    }
    return `${bingUrl}${urlBase}_${suffix}.jpg`;
  }
};
