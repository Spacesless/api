export interface PostalCode {
    /** 省份 */
    province?: string;
    /** 城市 */
    city?: string;
    /** 地区 */
    area?: string;
    /** 邮政编码 */
    post_code?: string;
    area_code?: string;
}
export interface PostalcodeQuery {
    /**
     * @description 省份、城市
     * @example 广州市天河区
     */
    keyword: string;
}
