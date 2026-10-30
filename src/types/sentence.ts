import type { NumericQuery, PaginationQuery } from './common';
/** 一言查询条件。 */
export interface SentenceFilter extends PaginationQuery {
    /** 一言分类，多个分类使用英文逗号分隔。 */
    type?: string;
    /** 句子最小长度。 */
    minLength?: NumericQuery;
    /** 句子最大长度。 */
    maxLength?: NumericQuery;
}
export interface Sentence {
    _id: string;
    /** ID */
    id: number;
    /** 提交 */
    commit_from: string;
    /** 创建时间 */
    created_at: string;
    /** 提交者 */
    creator: string;
    /** 出自 */
    from: string;
    /** 出自谁 */
    from_who?: string | null;
    /** 句子 */
    hitokoto: string;
    /** 长度 */
    length: number;
    /**
     * 类型
     * @enum {string}
     */
    type: "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l";
    /** UUID */
    uuid: string;
}
export interface SentenceQuery {
    /**
     * @description 类型，多个使用“,”逗号分隔
     * @example a,b
     */
    type?: "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l";
    /**
     * @description 句子最小长度
     * @example 5
     */
    minLength?: number;
    /**
     * @description 句子最大长度
     * @example 10
     */
    maxLength?: string;
}
export interface SentenceGetQuery {
    /**
     * @description 句子ID
     * @example 1149
     */
    id?: number;
}
export interface SentenceListQuery {
    /**
     * @description 分页
     * @example 1
     */
    page?: number;
    /**
     * @description 分页个数
     * @example 20
     */
    pageSize?: string;
    /**
     * @description 类型，多个使用“,”逗号分隔
     * @example a,b
     */
    type?: "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l";
    /**
     * @description 句子最小长度
     * @example 5
     */
    minLength?: number;
    /**
     * @description 句子最大长度
     * @example 10
     */
    maxLength?: string;
}
