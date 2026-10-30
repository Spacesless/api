import Base = require('./base');
import QRCode = require('qrcode');

export = class extends Base {
  /**
   * 二维码生成
   */
  async indexAction() {
    const { text, errorCorrectionLevel, type, quality, width, margin, fgColor, bgColor } = this.getApiQuery('/qrcode');

    const opts = {
      errorCorrectionLevel,
      margin: margin || 1,
      width: width || 256,
      rendererOpts: {
        quality
      },
      color: {
        dark: fgColor,
        light: bgColor
      }
    };

    let data = '';
    // decode URL 编码
    const decodeText = decodeURIComponent(text);
    try {
      if (type === 3) {
        data = await QRCode.toString(decodeText, { ...opts, type: 'svg' });
      } else {
        data = await QRCode.toDataURL(decodeText, opts);
      }

      if (type === 2 || type === 3) {
        return this.success(data);
      }

      // base64 需要把 dataURL的一些字符去掉
      const dataUrl = data.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(dataUrl, 'base64');
      this.ctx.type = 'image/png';
      this.body = imageBuffer;
    } catch (err) {
      return this.fail('生成二维码失败');
    }
  }
};
