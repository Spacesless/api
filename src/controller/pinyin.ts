import type { PinyinQuery } from '../types/pinyin';
import Base = require("./base");
import Pinyin = require("pinyin");

export = class extends Base {
  /**
   * @see https://pinyin.js.org/
   * @returns {Function}
   *
   * @summary 中文拼音转换
   * @description 基于 node-pinyin 包实现，https://pinyin.js.org/
   */
  async indexAction() {
    const { text, style, mode, segment, heteronym, group, compact } =
      this.getApiQuery<PinyinQuery>();

    const opts: NonNullable<Parameters<typeof Pinyin.pinyin>[1]> = {
      style: style || 0, // 拼音输出形式
      mode: mode ? "SURNAME" : "NORMAL", // 拼音模式
      segment: !!segment, // 分词方式
      heteronym: !!heteronym, // 是否启用多音字模式
      group: !!group, // 按词组分组拼音
      compact: !!compact, // 是否返回紧凑模式
    };

    const result = Pinyin.pinyin(text, opts);

    return this.success(result);
  }
};
