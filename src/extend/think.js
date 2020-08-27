const sharp = require('sharp');
const path = require('path');
const url = require('url');

module.exports = {
  /**
   * 创建目录
   * @param {String} dest 输入目录
   */
  mkdirDest(dest) {
    const destDir = path.dirname(dest);
    if (!think.isExist(destDir)) {
      think.mkdir(destDir);
    }
  },

  /**
   * 格式化图片
   * @param {String} src 源图片
   * @param {Object} outputOpts 目标图片参数 { quality: jpg/webp的压缩质量, lossless: webp无损压缩, compressionLevel: png的zlib压实级别 }
   */
  async sharpFormat(src, destDir, outputOpts) {
    const { format } = outputOpts; // 文件格式

    src = src.replace(think.ASSETS_PATH, '');
    let result;
    const destDirname = destDir ? path.join(path.dirname(src), destDir) : `${path.dirname(src)}/assets`;
    const dest = `${destDirname}/${path.basename(src)}@.${format}`;
    const destAbsolutePath = path.join(think.ASSETS_PATH, dest);
    // 如果已经存在则直接返回
    if (think.isExist(path.join(think.ASSETS_PATH, dest))) {
      return url.resolve('', dest);
    } else {
      this.mkdirDest(dest);
    }

    const fileSrc = path.join(think.ASSETS_PATH, src);
    if (!think.isExist(fileSrc)) return '';

    const image = await sharp(fileSrc);

    switch (format) {
      case 'png':
        result = await image.png(outputOpts)
          .toFile(destAbsolutePath);
        break;
      case 'webp':
        result = await image.webp(outputOpts)
          .toFile(destAbsolutePath);
        break;
      case 'jpg':
      case 'jpeg':
        result = await image.jpeg(think.extend(outputOpts, {
          chromaSubsampling: '4:4:4'
        })).toFile(destAbsolutePath)
          .catch(error => console.error(error, fileSrc));
        break;
    }

    return result ? url.resolve('', dest) : '';
  }
};
