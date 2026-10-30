import type { NumericQuery, PaginationQuery } from './common';
/** 笑话查询条件。 */
export interface JokeFilter extends PaginationQuery {
    /** 笑话类型，如反转、谐音、谐义或其他。 */
    type?: string;
    /** 幽默等级，现有接口支持 1 和 5。 */
    level?: NumericQuery;
}
export interface Joke {
    _id: string;
    /** 笑话内容 */
    content: string;
    /**
     * 类型
     * @enum {string}
     */
    type: "反转" | "谐音" | "谐义" | "其他";
    /**
     * 等级
     * @enum {integer}
     */
    level: 1 | 5;
}
export interface JokeQuery {
    /**
     * @description 笑话类型
     * @example 反转
     */
    type?: "反转" | "谐音" | "谐义" | "其他";
    /**
     * @description 笑话等级
     * @example 5
     */
    level?: 1 | 5;
}
export interface JokeListQuery {
    /**
     * @description 页码
     * @example 1
     */
    page?: number;
    /**
     * @description 分页个数
     * @example 10
     */
    pageSize?: number;
    /**
     * @description 笑话类型
     * @example 反转
     */
    type?: "反转" | "谐音" | "谐义" | "其他";
    /**
     * @description 笑话等级
     * @example 5
     */
    level?: 1 | 5;
}
