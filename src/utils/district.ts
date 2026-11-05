import type { DistrictDetail, DistrictNode, DistrictSearchQuery, DistrictSourceRecord } from '../types/district';

/** 一份基础记录和引用索引，不加载包内其他分级表或缓存完整四级树。 */
export class DistrictIndex {
  private readonly byCode = new Map<string, DistrictNode>();
  private readonly byParent = new Map<string | null, DistrictNode[]>();
  private readonly records: DistrictNode[];

  constructor(source: DistrictSourceRecord[]) {
    for (const row of source) {
      const level = Number(row.town) ? 4 : Number(row.area) ? 3 : Number(row.city) ? 2 : 1;
      const code = level === 4 ? row.code + String(row.town).padStart(6, '0') : row.code;
      // 源数据可能重复，同一编码保持首条，避免级联和详情出现不同结果。
      if (this.byCode.has(code)) continue;
      this.byCode.set(code, { code, name: row.name, level, parentCode: null });
    }
    this.records = [...this.byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
    for (const node of this.records) {
      const province = node.code.slice(0, 2) + '0000';
      const city = node.code.slice(0, 4) + '00';
      const area = node.code.slice(0, 6);
      if (node.level > 1 && this.byCode.has(province)) node.provinceCode = province;
      if (node.level > 2 && city !== node.code && this.byCode.has(city)) node.cityCode = city;
      if (node.level === 4 && this.byCode.has(area)) node.areaCode = area;
      // 直辖市、港澳可能没有市级记录；不制造虚拟节点。
      node.parentCode = node.areaCode ?? node.cityCode ?? node.provinceCode ?? null;
      const siblings = this.byParent.get(node.parentCode) ?? [];
      siblings.push(node);
      this.byParent.set(node.parentCode, siblings);
    }
  }

  children(code?: string): DistrictNode[] {
    return (this.byParent.get(code || null) ?? []).map(node => ({ ...node }));
  }

  detail(code: string): DistrictDetail | undefined {
    const row = this.byCode.get(code);
    if (!row) return;
    const path: DistrictNode[] = [];
    let current: DistrictNode | undefined = row;
    while (current) {
      path.unshift({ ...current });
      current = current.parentCode ? this.byCode.get(current.parentCode) : undefined;
    }
    return { ...row, path };
  }

  tree(code: string | undefined, maxLevel: number): DistrictNode[] {
    const visit = (node: DistrictNode): DistrictNode => {
      const result = { ...node };
      const children = (this.byParent.get(node.code) ?? []).filter(child => child.level <= maxLevel);
      if (children.length) result.children = children.map(visit);
      return result;
    };
    const roots = code ? (this.byCode.has(code) ? [this.byCode.get(code)!] : []) : this.byParent.get(null) ?? [];
    return roots.filter(row => row.level <= maxLevel).map(visit);
  }

  search({ keyword, limit = 20, maxLevel = 3, provinceCode }: DistrictSearchQuery): DistrictNode[] {
    const result: DistrictNode[] = [];
    for (const row of this.records) {
      if (row.level > Number(maxLevel)) continue;
      if (provinceCode && row.code !== provinceCode && row.provinceCode !== provinceCode) continue;
      if (!row.name.startsWith(keyword) && !row.code.startsWith(keyword)) continue;
      result.push({ ...row });
      if (result.length >= Number(limit)) break;
    }
    return result;
  }
}

let index: DistrictIndex | undefined;

/** 首次调用时require单个总表并建立索引，后续复用模块缓存和索引。 */
export function getDistrictIndex(): DistrictIndex {
  if (!index) {
    const source: DistrictSourceRecord[] = require('province-city-china/dist/data.json');
    index = new DistrictIndex(source);
  }
  return index;
}
