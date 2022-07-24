const Base = require('./base');

module.exports = class extends Base {
  async indexAction() {
    const { keyword } = this.get();

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
