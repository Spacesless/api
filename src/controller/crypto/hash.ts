import type { CryptoHashMd5Query, CryptoHashShaQuery, CryptoHashUuidQuery } from '../../types/crypto';
import Base = require('../base');
import CryptoJS = require('crypto-js');

export = class extends Base {
  /**
   * @summary MD5
   * @description MD5 是一种广泛使用的哈希函数
   */
  md5Action() {
    const { message, size, textCase } = this.getApiQuery<CryptoHashMd5Query>();

    let hash = CryptoJS.MD5(message).toString(CryptoJS.enc.Hex);

    if (Number(size) === 16) {
      hash = hash.substr(8, 16);
    }

    if (textCase === 'upper') {
      hash = hash.toUpperCase();
    }

    return this.success(hash);
  }

  /**
   * @summary SHA
   * @description SHA 哈希函数由国家安全局设计，是一个密码散列函数家族
   */
  shaAction() {
    const { message, algorithm } = this.getApiQuery<CryptoHashShaQuery>();

    const algorithmEnum = {
      1: CryptoJS.SHA1,
      256: CryptoJS.SHA256,
      512: CryptoJS.SHA512
    };

    const handler = algorithmEnum[(algorithm || 256) as keyof typeof algorithmEnum];
    const hash = (handler && handler(message).toString(CryptoJS.enc.Hex)) || '';

    return this.success(hash);
  }

  /**
   * @summary UUID
   */
  uuidAction() {
    const { textCase, version, count } = this.getApiQuery<CryptoHashUuidQuery>();

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
