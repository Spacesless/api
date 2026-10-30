/** 行政区划级联节点。 */
export interface DistrictNode {
    /** 当前行政区划编码。 */
    code: string;
    /** 行政区划名称。 */
    name: string;
    /** 所属省级行政区编码。 */
    provinceCode?: string;
    /** 所属地级行政区编码。 */
    cityCode?: string;
    /** 所属县级行政区编码。 */
    areaCode?: string;
    /** 下级行政区划节点，末级节点可不包含此字段。 */
    children?: DistrictNode[];
}
export interface DistrictQuery {
    /**
     * @description 联动等级2、3、4
     * @example 2
     */
    level: string;
}
export interface DistrictGetChildrenQuery {
    /**
     * @description 地区编号
     * @example 4406
     */
    code?: string;
}
export interface DistrictSearchQuery {
    /**
     * @description 地区名称、地区编号
     * @example 南宁
     */
    keyword?: string;
    /**
     * @description 是否需要保留父级数据，默认为0，不保留
     * @example 1
     */
    keepParent?: "true" | "1" | "false" | "0";
}
