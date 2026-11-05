/** 行政区划级联节点。 */
export interface DistrictNode {
    /** 当前行政区划编码。 */
    code: string;
    /** 行政区划名称。 */
    name: string;
    /** 行政层级：1省、2市、3区县、4乡镇街道。 */
    level: number;
    /** 直属父级编码，省级为null。 */
    parentCode: string | null;
    /** 所属省级行政区编码。 */
    provinceCode?: string;
    /** 所属地级行政区编码。 */
    cityCode?: string;
    /** 所属县级行政区编码。 */
    areaCode?: string;
    /** 下级行政区划节点，末级节点可不包含此字段。 */
    children?: DistrictNode[];
}
/** province-city-china/dist/data.json中的源记录。街道code为所属区县，需拼接town。 */
export interface DistrictSourceRecord {
    code: string;
    name: string;
    province: string | number;
    city: string | number;
    area: string | number;
    town: string | number;
}
export interface DistrictGetChildrenQuery {
    /**
     * @description 地区编号
     * @example 440600
     */
    code?: string;
}
export interface DistrictSearchQuery {
    /**
     * @description 地区名称或地区编号前缀，必填
     * @example 南宁
     */
    keyword: string;
    /** 返回候选数量，默认20，最多100。 */
    limit?: number | string;
    /** 最深行政层级，默认3，传4包含街道。 */
    maxLevel?: number | string;
    /** 限定所属省份，使用数据源中的省级编码。 */
    provinceCode?: string;
}
export interface DistrictTreeQuery {
    /** 子树根编码；level=4时必填，使用数据源中的省、市或区县编码。 */
    code?: string;
    /** 最深行政层级，默认3，可选1至4。 */
    level?: number | string;
}
export interface DistrictDetailQuery {
    /** 精确地区编码，支持街道。 */
    code: string;
}
export interface DistrictDetail extends DistrictNode {
    /** 从省级到当前地区的完整路径。 */
    path: DistrictNode[];
}
