import Base = require('../base');
import CryptoJS = require('crypto-js');

// 8位十六进制数作为密钥偏移量
const SECRET_IV = CryptoJS.enc.Utf8.parse('66886688');

export = class extends Base {
  indexAction() {
    const { message, secret, algorithm, type } = this.getApiQuery('/crypto/cipher');

    const findAlgorithm = CryptoJS[algorithm as 'AES' | 'DES' | 'TripleDES' | 'Rabbit' | 'RC4' | 'RC4Drop'];
    const secretHex = CryptoJS.enc.Utf8.parse(secret);

    let result;
    if (type) {
      // 解密
      const encryptedHexStr = CryptoJS.enc.Hex.parse(message);
      const str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
      const decrypted = findAlgorithm.decrypt(str, secretHex, {
        iv: SECRET_IV
      });
      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
      result = decryptedStr.toString();
    } else {
      // 加密
      const dataHex = CryptoJS.enc.Utf8.parse(message);
      const encrypted = findAlgorithm.encrypt(dataHex, secretHex, {
        iv: SECRET_IV
      });
      result = encrypted.ciphertext.toString();
    }
    return this.success(result);
  }
};
