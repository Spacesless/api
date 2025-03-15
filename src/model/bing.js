module.exports = class extends think.Mongo {
  /**
   * 查询指定日期壁纸
   * @param {String} date 日期，如2022-07-22
   * @returns {Promise}
   */
  findRecord(date) {
    return this.where({ time: date })
      .find();
  }

  // 查询随机壁纸
  async randomRecord() {
    const count = await this.count('id');

    const offset = Math.floor(Math.random() * count);

    return this.limit(offset, 1)
      .select();
  }

  /**
   * 分页查询壁纸
   * @param {Number} page 页码
   * @param {Number} pageSize 每页个数
   * @returns {Promise}
   */
  selectRecord(page, pageSize) {
    return this.order('time DESC')
      .page(page, pageSize)
      .countSelect();
  }

  /**
   * 添加壁纸
   * @param {Object} data
   * @returns {Promise}
   */
  addRecord(data) {
    const { title, copyright, url, urlbase, enddate } = data;

    const time = enddate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
    const record = {
      title,
      copyright,
      url,
      urlbase,
      time
    };

    return this.where({ time })
      .thenAdd(record);
  }
};
