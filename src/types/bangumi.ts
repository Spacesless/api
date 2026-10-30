/** 番组数据源中的动画条目。 */
export interface BangumiItem {
    /** 开播时间，供年份和月份筛选使用。 */
    begin: string;
    /** 番组原始标题。 */
    title: string;
    /** 按语言分组的译名列表。 */
    titleTranslate: Record<string, string[]>;
    /** 保留数据源中的其他字段，不在此处假设其具体结构。 */
    [key: string]: unknown;
}
export interface BangumiQuery {
    /**
     * @description 年份
     * @example 2020
     */
    year?: string;
    /**
     * @description 月份
     * @example 10
     */
    month?: string;
    /**
     * @description 标题
     * @example 日常
     */
    title?: string;
}
