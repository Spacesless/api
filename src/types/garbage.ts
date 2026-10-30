export interface GarbageQuery {
    /**
     * @description 垃圾名称
     * @example 牛奶盒
     */
    keyword?: string;
    /**
     * @description 垃圾类别：可回收物,有害垃圾,湿垃圾,干垃圾,大件垃圾
     * @example
     */
    category?: string;
    /** @description 页码 */
    page?: number;
    /** @description 分页个数 */
    pageSize?: number;
}
