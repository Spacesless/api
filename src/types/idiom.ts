export interface Idiom {
    _id?: string;
    /** 查询的成语 */
    name?: string;
    /** 拼音 */
    pinyin?: string | null;
    /** 基本释义 */
    jbsy?: string[] | null;
    /** 详细释义 */
    xxsy?: string[] | null;
    /** 出处 */
    chuchu?: string | null;
    /** 例句 */
    liju?: string | null;
    /** 近义词 */
    jyc?: string[] | null;
    /** 反义词 */
    fyc?: string[] | null;
}
export interface IdiomQuery {
    /**
     * @description 查询的成语
     * @example 一心一意
     */
    wd: string;
    /**
     * @description 页码
     * @example
     */
    page?: number;
    /**
     * @description 每页个数
     * @example
     */
    pageSize?: number;
}
export interface IdiomRelayQuery {
    /**
     * @description 成语或结束文字
     * @example 一心一意
     */
    wd: string;
    /**
     * @description 页码
     * @example
     */
    page?: number;
    /**
     * @description 每页个数，默认10
     * @example
     */
    pageSize?: number;
}
