const Base = require('../base');
const CryptoJS = require('crypto-js');

module.exports = class extends Base {
  md5Action() {
    const { message, size, textCase } = this.get();

    let hash = CryptoJS.MD5(message).toString(CryptoJS.enc.Hex);

    if (+size === 16) {
      hash = hash.substr(8, 16);
    }

    if (textCase === 'upper') {
      hash = hash.toUpperCase();
    }

    return this.success(hash);
  }

  shaAction() {
    const { message, algorithm } = this.get();

    const algorithmEnum = {
      1: CryptoJS.SHA1,
      256: CryptoJS.SHA256,
      512: CryptoJS.SHA512
    };

    const handler = algorithmEnum[algorithm || 256];
    const hash = (handler && handler(message).toString(CryptoJS.enc.Hex)) || '';

    return this.success(hash);
  }

  uuidAction() {
    const { textCase, version, count } = this.get();

    const result = [];
    const targetCount = count || 1;
    for (let i = 0; i < targetCount; i++) {
      let hash = think.uuid('v' + (version || 4));
      if (textCase === 'upper') {
        hash = hash.toUpperCase();
      }
      result.push(hash);
    }

    return this.success(result);
  }
};
