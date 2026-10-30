import Base = require('./base');

export = class extends Base {
  async indexAction() {
    const { keyword } = this.getApiQuery('/postalcode');

    const list = await this.mongo('postalcode')
      .where({
        $or: [
          {
            province: {
              $regex: keyword
            }
          },
          {
            city: {
              $regex: keyword
            }
          },
          {
            area: {
              $regex: keyword
            }
          }
        ]
      })
      .select();

    return this.success(list);
  }
};
