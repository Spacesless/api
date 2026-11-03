export enum HistoryType {
  /** 历史事件。 */
  Event = 'event',
  /** 人物出生。 */
  Birth = 'birth',
  /** 人物逝世。 */
  Death = 'death'
}

export interface HistoryEvent {
  /** 事件月日，格式MM-DD，支持02-29。 */
  date: string;
  /** 发生年份，公元前用负数，不使用公元0年。 */
  year: number;
  /** 历史事件、人物出生或人物逝世。 */
  type: HistoryType;
  /** 纯文本事件标题，不含年份前缀、图片和链接。 */
  title: string;
}

export interface HistoryQuery {
  /** 月日，格式MM-DD；默认北京时间当天，支持02-29。 */
  date?: string;
  /** 类型精确筛选，默认返回全部类型。 */
  type?: HistoryType;
}

export interface HistorySearchQuery {
  /** 标题关键词，按字面包含关系匹配，不区分英文字母大小写。 */
  keyword?: string;
  /** 类型精确筛选，默认返回全部类型。 */
  type?: HistoryType;
  /** 起始年份，包含该年；范围-9999至9999，公元前用负数，不允许0。 */
  startYear?: number;
  /** 结束年份，包含该年；范围-9999至9999，公元前用负数，不允许0。 */
  endYear?: number;
  /** 页码，默认1。 */
  page?: number;
  /** 每页条数，默认20，最多50。 */
  pageSize?: number;
}
