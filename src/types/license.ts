export interface License {
    /** 省份 */
    province: string;
    /** 城市 */
    city: string;
    /** 简称 */
    code: string;
    /** 车牌前缀 */
    prefix: string;
}
export interface LicenseQuery {
    /**
     * @description 省份名称、简称、城市名
     * @example 广州市
     */
    keyword: string;
}
