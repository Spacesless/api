const Base = require('../base');
const CryptoJS = require('crypto-js');

module.exports = class extends Base {
  indexAction() {
    const { message, algorithm, type = 0 } = this.get();

    const findAlgorithm = CryptoJS.enc[algorithm];

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
