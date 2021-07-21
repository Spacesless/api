const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);
    this.apiUrl = 'https://sapi.k780.com';
    this.signKey = fs.readJsonSync(path.join(think.ASSETS_PATH, 'weather.json'));
  }

  /**
   * 1.实时天气，在原有功能基础上新加入风速、能见度、降雨量、气压。
   * 2.未来5-7天预报。
   * 3.未来逐小时预报。
   * 4.PM2.5 aqi。
   * 5.生活指数。
   * @see https://www.nowapi.com/api/weather.realtime
   */
  async indexAction(sign, failFlag = 0) {
    const { weaid, ag } = this.get();
    await axios.get(this.apiUrl, {
      params: {
        app: 'weather.realtime',
        weaid: weaid,
        ag: ag || 'today,futureDay,lifeIndex,futureHour',
        appkey: 10003,
        sign: sign || this.signKey.sign
      }
    }).then(async res => {
      const { success, msgid, msg, result } = res.data;
      if (success === '1') {
        return this.success(result);
      } else {
        if (msgid === '1000553' && failFlag < 1) { // sign过期，重试一次
          const sign = await this.refreshSign();
          failFlag++;
          return this.indexAction(sign, failFlag);
        }
        return this.fail(`${msgid}，${msg}`);
      }
    });
  }

  /**
   * 历史天气
   * 2015-07-07之后，包括当天
   * @see https://www.nowapi.com/api/weather.history
   */
  async historyAction(sign, failFlag = 0) {
    const { weaid, date } = this.get();
    await axios.get(this.apiUrl, {
      params: {
        app: 'weather.history',
        weaid: weaid,
        date: date,
        appkey: 10003,
        sign: sign || this.signKey.sign
      }
    }).then(async res => {
      const { success, msgid, msg, result } = res.data;
      if (success === '1') {
        return this.success(result);
      } else {
        if (msgid === '1000553' && failFlag < 1) { // sign过期，重试一次
          const sign = await this.refreshSign();
          failFlag++;
          return this.historyAction(sign, failFlag);
        }
        return this.fail(`${msgid}，${msg}`);
      }
    });
  }

  // 获取nowapi的测试sign key
  refreshSign() {
    return axios.get('https://www.nowapi.com/api/weather.wtype').then(res => {
      const reg = new RegExp('(^|&)sign=([^&]*)(&|$)');
      const matchArr = res.data.match(reg);
      if (matchArr != null) {
        const sign = decodeURI(matchArr[2]);
        const signKey = { sign };
        fs.writeJsonSync(path.join(think.ASSETS_PATH, 'weather.json'), signKey);
        return sign;
      }
    });
  }
};
