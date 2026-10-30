export interface Poem {
    _id: string;
    /** 作者 */
    author: string;
    /** 内容 */
    paragraphs: string[];
    /** 标签 */
    tags?: string[];
    /** 标题 */
    title: string;
    /** 注释 */
    prologue?: string;
}
export interface PoetryQuery {
    /**
     * @description 作者
     * @example 李白
     */
    author?: string;
    /** @description 关键词 */
    keyword?: string;
    /** @description 页码 */
    page?: number;
    /** @description 每页个数 */
    pageSize?: number;
}
