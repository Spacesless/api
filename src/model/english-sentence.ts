import type { NumericQuery, IcibaSentence, EnglishSentence } from '../types/data';
export = class extends think.Mongo<EnglishSentence> {
  /**
   * 查询指定日期句子
   * @param {String} date 日期，如2022-07-22
   * @returns {Promise}
   */
  findRecord(date: string) {
    return this.where({ date })
      .find();
  }

  // 查询随机句子
  async randomRecord() {
    const count = await this.count('id');

    const offset = Math.floor(Math.random() * count);

    return this.limit(offset, 1)
      .select();
  }

  /**
   * 分页查询句子
   * @param {Number} page 页码
   * @param {Number} pageSize 每页个数
   * @returns {Promise}
   */
  selectRecord(page?: NumericQuery, pageSize?: NumericQuery) {
    return this.order('date DESC')
      .page(page, pageSize)
      .countSelect();
  }

  /**
   * 添加句子
   * @param {Object} data
   * @returns {Promise}
   */
  addRecord(data: IcibaSentence) {
    const { sid, tts, content, note, translation, picture, picture2, picture3, picture4, fenxiang_img: sharePicture, caption, dateline } = data;

    const record = {
      sid,
      date: dateline,
      content,
      note,
      sharePicture,
      picture,
      middlePicture: picture2,
      smallPicture: picture3,
      largePicture: picture4,
      tts,
      caption,
      translation
    };

    return this.where({ date: dateline })
      .thenAdd(record);
  }
};
