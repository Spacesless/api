import Base = require('../base');
import CryptoJS = require('crypto-js');

export = class extends Base {
  indexAction() {
    const { message, algorithm, type = 0 } = this.getApiQuery('/crypto/encoder');

    const findAlgorithm = CryptoJS.enc[algorithm as keyof typeof CryptoJS.enc];

    let result = '';
    if (type) {
      // 解码
      const words = findAlgorithm.parse(message);
      result = CryptoJS.enc.Utf8.stringify(words);
    } else {
      // 编码
      const words = CryptoJS.enc.Utf8.parse(message);
      result = findAlgorithm.stringify(words);
    }

    return this.success(result);
  }
};
