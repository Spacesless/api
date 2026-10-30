/** 数字查询参数：原始请求可能为字符串，Logic 校验后可能转换为数字。 */
export type NumericQuery = number | string;
/** 分页查询参数。 */
export interface PaginationQuery {
    /** 页码；默认值由现有查询逻辑处理。 */
    page?: NumericQuery;
    /** 每页记录数。 */
    pageSize?: NumericQuery;
}
/** ThinkJS MongoDB 分页查询结果。 */
export interface PageResult<T> {
    /** 符合条件的记录总数。 */
    count: number;
    /** 总页数。 */
    totalPages: number;
    /** 每页记录数。 */
    pageSize: number;
    /** 当前页码。 */
    currentPage: number;
    /** 当前页的记录列表。 */
    data: T[];
}
/** MongoDB 查询条件，允许组合字段条件和查询操作符。 */
export type MongoFilter = Record<string, unknown>;
