const Searcher = require('../utils/ip2region');
const path = require('path');
const Base = require('./base');

// 指定ip2region数据文件路径
const dbPath = path.join(think.ASSETS_PATH, 'ip2region.xdb');

module.exports = class extends Base {
  /**
   * 成语大全
   */
  async indexAction() {
    const ip = this.get('ip') || this.ctx.ip.replace('::ffff:', '');

    // 同步读取vectorIndex
    const vectorIndex = Searcher.loadVectorIndexFromFile(dbPath);
    // 创建searcher对象
    const searcher = Searcher.newWithVectorIndex(dbPath, vectorIndex);
    // 查询 await 或 promise均可
    const data = await searcher.search(ip).catch(() => {});

    // eslint-disable-next-line no-unused-vars
    const [country, unkown, province, city, isp] = data?.region.split('|') || [];

    return this.success({
      ip,
      country: formatRegion(country),
      province: formatRegion(province),
      city: formatRegion(city),
      isp: formatRegion(isp)
    });
  }
};

function formatRegion(str) {
  return !str || str === '0' ? '' : str;
}
