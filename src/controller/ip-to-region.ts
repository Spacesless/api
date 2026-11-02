import type { IpRegion, IpToRegionQuery } from '../types/ip-to-region';
import Searcher = require("../utils/ip2region");
import { isIP } from 'node:net';
import Base = require("./base");

export = class extends Base {
  /**
   * @summary IP归属地查询
   * @description 支持 IPv4（默认）和 IPv6 地址查询归属地，IP 库中查不到的字段为空字符串。
   */
  async indexAction() {
    const query = this.getApiQuery<IpToRegionQuery>();
    const version = Number(query.version ?? 4);
    if (version !== 4 && version !== 6) return this.fail('version 仅支持 4 或 6');

    let ip = query.ip || this.ctx.ip;
    // 兼容 IPv4 经双栈监听进入服务时的映射地址，仅处理自动获取的客户端 IP。
    if (!query.ip && version === 4 && /^::ffff:/i.test(ip)) {
      const mapped = ip.slice(7);
      if (isIP(mapped) === 4) ip = mapped;
    }
    if (isIP(ip) !== version) return this.fail(`请提供有效的 IPv${version} 地址`);

    const data = await Searcher.search(ip, version);
    // 新版数据库格式：国家|省份|城市|ISP|国家代码。
    const [country, province, city, isp] = data.split('|');

    const result: IpRegion = {
      ip,
      country: formatRegion(country),
      province: formatRegion(province),
      city: formatRegion(city),
      isp: formatRegion(isp),
    };
    return this.success(result);
  }
};

function formatRegion(str?: string) {
  return !str || str === "0" ? "" : str;
}
