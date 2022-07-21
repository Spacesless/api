module.exports = class extends think.Model {
  findRecord(date) {
    return this.where({ time: date })
      .find();
  }

  async randomRecord() {
    const count = await this.count('id');

    const offset = Math.floor(Math.random() * count);

    return this.limit(offset, 1)
      .select();
  }

  selectRecord(page, pageSize) {
    return this.order('time DESC')
      .page(page, pageSize)
      .countSelect();
  }

  addRecord(data) {
    const { title, copyright, url, urlbase, enddate } = data;
    const id = urlbase ? urlbase.split('=').pop() : url;
    const record = {
      id,
      title,
      copyright,
      url,
      time: enddate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
    };

    return this.where({ id })
      .thenAdd(record);
  }
};
