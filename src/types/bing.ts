/** Bing 壁纸接口返回的原始图片数据。 */
export interface BingSourceImage {
    /** 壁纸标题。 */
    title: string;
    /** 版权和拍摄说明。 */
    copyright: string;
    /** 上游返回的图片地址，可能为相对路径。 */
    url: string;
    /** 不含分辨率后缀的图片路径，用于拼接不同尺寸地址。 */
    urlbase: string;
    /** 上游日期，格式为 YYYYMMDD，入库时转换为 time。 */
    enddate: string;
}
/** Bing 壁纸入库记录。 */
export interface BingRecord {
    /** 壁纸标题。 */
    title: string;
    /** 版权和拍摄说明。 */
    copyright: string;
    /** 图片地址，返回时可按尺寸重新拼接。 */
    url: string;
    /** 用于生成不同分辨率地址的图片基础路径。 */
    urlbase: string;
    /** 壁纸日期，格式为 YYYY-MM-DD。 */
    time: string;
}
export interface BingImage {
    _id: string;
    /** 版权信息 */
    copyright: string;
    /** 壁纸日期 */
    time: string;
    /** 标题 */
    title: string;
    /** 地址 */
    url: string;
    urlbase: string;
}
export interface BingQuery {
    /**
     * @description 查询指定日期图片
     * @example 2021-10-04
     */
    date?: string;
    /**
     * @description 响应格式，不传默认重定向图片地址
     * @example json
     */
    format?: string;
    /**
     * @description 图片尺寸
     * @example large
     */
    size?: "default" | "mini" | "small" | "middle" | "large" | "mobile-mini" | "mobile-small" | "mobile-middle" | "mobile-default";
}
export interface BingRandomQuery {
    /**
     * @description 响应格式，不传默认重定向图片地址
     * @example json
     */
    format?: string;
    /**
     * @description 图片尺寸
     * @example large
     */
    size?: "default" | "mini" | "small" | "middle" | "large" | "mobile-mini" | "mobile-small" | "mobile-middle" | "mobile-default";
}
export interface BingListQuery {
    /** @example  */
    page?: string;
    /** @example  */
    pageSize?: string;
    /**
     * @description 图片尺寸
     * @example large
     */
    size?: "default" | "mini" | "small" | "middle" | "large" | "mobile-mini" | "mobile-small" | "mobile-middle" | "mobile-default";
}
