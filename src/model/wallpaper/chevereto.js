module.exports = class extends think.Model {
  /**
   * 随机查询图片
   * @param {String} album 相册名称
   * @returns {Promise}
   */
  async randomRecord(findAlbum) {
    let imageCount = 0;
    const where = {};
    if (findAlbum) {
      imageCount = findAlbum.album_image_count;
      where.image_album_id = findAlbum.album_id;
    } else {
      imageCount = await this.model('images', 'mysql').count();
    }
    const offset = Math.floor(Math.random() * imageCount);

    return this.model('images', 'mysql')
      .field('image_name,image_size,image_width,image_height,image_date,image_extension,image_description')
      .where(where)
      .limit(offset, 1)
      .select();
  }

  /**
   * 分页查询图片
   * @param {Object} param0
   * @returns {Promise}
   */
  async selectRecord({ findAlbum, page, pageSize }) {
    const where = {};
    if (findAlbum) {
      where.image_album_id = findAlbum.album_id;
    }

    const model = this.model('images', 'mysql');
    model._pk = 'image_id';
    return model
      .field('image_name,image_size,image_width,image_height,image_date,image_extension,image_description')
      .where(where)
      .page(page, pageSize)
      .countSelect();
  }
};
