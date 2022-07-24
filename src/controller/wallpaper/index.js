const moment = require('moment');
const Base = require('../base');

const baseUrl = 'http://img.timelessq.com';

module.exports = class extends Base {
  constructor(...args) {
    super(...args);
    this.modelInstance = this.mongo('wallpaper/chevereto', 'mysql');
  }

  async indexAction() {
    const { album, format } = this.get();

    const findAlbum = await this.getAlbumIdByName(album);
    const list = await this.modelInstance.randomRecord(findAlbum);

    if (list.length) {
      const record = list[0];
      const result = this.formatResponse(record);
      if (format === 'json') {
        return this.success(result);
      } else {
        this.ctx.redirect(result.url);
      }
    } else {
      this.fail('未找到相关记录');
    }
  }

  async listAction() {
    const { album, page, pageSize } = this.get();

    const findAlbum = await this.getAlbumIdByName(album);

    const list = await this.modelInstance.selectRecord({
      findAlbum,
      page,
      pageSize
    });

    const result = [];
    list.data.forEach(item => {
      const formatItem = this.formatResponse(item);
      result.push(formatItem);
    });
    list.data = result;

    return this.success(list);
  }

  async albumAction() {
    const { force } = this.get();

    if (force) {
      await this.cache('albumList', null);
    }

    const list = await this.getAlbumList();

    return this.success(list);
  }

  // 格式化图片内容
  formatResponse(source) {
    return {
      url: `${baseUrl}/images/${moment(source.image_date).format('YYYY/MM/DD')}/${source.image_name}.${source.image_extension}`,
      imageWidth: source.image_width,
      imageHeight: source.image_height,
      descriptionz: source.image_description
    };
  }

  // 获取相册列表
  getAlbumList() {
    return this.model('albums', 'mysql')
      .cache('albumList', {
        type: 'file',
        timeout: 30 * 24 * 3600 * 1000
      })
      .field('album_id,album_name,album_image_count')
      .select();
  }

  /**
   * 根据名称查询相册
   * @param {String} album 相册名称
   * @returns {Object}
   */
  async getAlbumIdByName(album) {
    if (!album) {
      return;
    }
    const albumList = await this.getAlbumList();
    const findAlbum = albumList.find(item => item.album_name === album);
    return findAlbum;
  }
};
