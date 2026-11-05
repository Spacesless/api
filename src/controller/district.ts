import type { DistrictDetailQuery, DistrictGetChildrenQuery, DistrictSearchQuery, DistrictTreeQuery } from '../types/district';
import { getDistrictIndex } from '../utils/district';
import Base = require('./base');

export = class extends Base {
  /**
   * @summary 行政区划下级列表
   * @description 使用province-city-china本地数据。懒加载级联：不传code返回省级，传code返回直属下级，按编码排序。省市区使用六位编码，街道使用十二位编码。街道或不存在的编码返回空数组。
   */
  indexAction() {
    const { code } = this.getApiQuery<DistrictGetChildrenQuery>();
    return this.success(getDistrictIndex().children(code));
  }

  /**
   * @summary 获取下级行政区划
   * @description 与/district相同，用于按需加载直属下级，使用本地数据，不依赖数据库。
   */
  getChildrenAction() {
    const { code } = this.getApiQuery<DistrictGetChildrenQuery>();
    return this.success(getDistrictIndex().children(code));
  }

  /**
   * @summary 行政区划树
   * @description level为最深行政层级，默认3。code可限定某地区及其后代，树包含该地区本身；四级树必须指定省、市或区县code。直辖市和港澳缺少市级节点时直接挂在省级，不人为补层级。
   */
  treeAction() {
    const { code, level = 3 } = this.getApiQuery<DistrictTreeQuery>();
    if (Number(level) === 4 && !code) return this.fail('四级树必须指定地区code');
    return this.success(getDistrictIndex().tree(code, Number(level)));
  }

  /**
   * @summary 行政区划详情和路径
   * @description 按编码查询本地数据，path从省级到当前地区，适合表单回显。不存在返回业务错误，不加载下级。
   */
  detailAction() {
    const { code } = this.getApiQuery<DistrictDetailQuery>();
    const data = getDistrictIndex().detail(code);
    if (!data) return this.fail('地区不存在');
    return this.success(data);
  }

  /**
   * @summary 行政区划搜索
   * @description 名称或编码前缀搜索，返回按编码排序的平铺候选项。默认只查省市区，limit默认20、最多100；maxLevel=4时包含街道。provinceCode使用六位省级编码。不查询数据库，不组装搜索树。
   */
  searchAction() {
    const query = this.getApiQuery<DistrictSearchQuery>();
    const keyword = query.keyword.trim();
    if (!keyword) return this.fail('keyword不能为空白');
    return this.success(getDistrictIndex().search({ ...query, keyword }));
  }
};
