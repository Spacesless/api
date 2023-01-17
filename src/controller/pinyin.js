const Base = require('./base');
const Pinyin = require('pinyin');

module.exports = class extends Base {
  /**
   * 中文拼音转换
   * @see https://pinyin.js.org/
   * @returns {Function}
   */
  async indexAction() {
    const { text, style, mode, segment, heteronym, group, compact } = this.get();

    const opts = {
      style: style || 0, // 拼音输出形式
      mode: mode ? 'SURNAME' : 'NORMAL', // 拼音模式
      segment: !!segment, // 分词方式
      heteronym: !!heteronym, // 是否启用多音字模式
      group: !!group, // 按词组分组拼音
      compact: !!compact // 是否返回紧凑模式
    };

    const result = Pinyin.pinyin(text, opts);

    return this.success(result);
  }
};
