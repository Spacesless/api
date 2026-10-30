/** 国家或地区的电话区号信息。 */
export interface AreaCode {
    /** 国家或地区名称。 */
    name: string;
    /** 国际电话区号。 */
    phoneCode: string;
}
export interface AreaCodeQuery {
    /**
     * @description 关键词，可以根据地区名称或电话区号查询
     * @example 中国
     */
    keyword?: string;
}
