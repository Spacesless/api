/** chinese-xinhua 汉字记录。同一个字可以存在多条读音或释义记录。 */
export interface DictionaryWord {
  _id: string;
  /** 汉字。 */
  word: string;
  /** 数据源的原字形，可能是繁体或异体字。 */
  oldword: string;
  /** 总笔画数；保留数据源的字符串格式。 */
  strokes: string;
  /** 数据源提供的带声调拼音。 */
  pinyin: string;
  /** 部首；部分记录为空字符串。 */
  radicals: string;
  /** 基本释义，保留换行。 */
  explanation: string;
  /** 详细释义，保留原始文本。 */
  more: string;
}

export interface Xiehouyu {
  _id: string;
  /** 歇后语前半句。 */
  riddle: string;
  /** 歇后语后半句，保留原始答案及标点。 */
  answer: string;
}

/** CSV 对联数据，保留原始标点，同一上联可以对应多条下联。 */
export interface Couplet {
  _id: string;
  /** 上联。 */
  up: string;
  /** 下联。 */
  down: string;
}

export interface DictionaryPageQuery {
  /** 页码，默认 1。 */
  page?: number;
  /** 每页条数，默认 10，最多 50。 */
  pageSize?: number;
}

export interface DictionaryWordQuery extends DictionaryPageQuery {
  /** 汉字精确查询，同时匹配 word 和 oldword，不合并同字的多条记录。 */
  word?: string;
  /** 部首精确查询，例如口。缺少部首的记录不会被匹配。 */
  radicals?: string;
  /** 总笔画数，正整数；查询时转换为数据源的字符串格式。 */
  strokes?: number;
  /** 在汉字、原字形和基本释义中搜索字面内容，不支持正则表达式。 */
  keyword?: string;
}

export interface XiehouyuQuery extends DictionaryPageQuery {
  /** 按前半句的字面内容模糊查询。 */
  riddle?: string;
  /** 按答案的字面内容反查。 */
  answer?: string;
  /** 同时搜索前半句和答案，不支持正则表达式。 */
  keyword?: string;
}

export interface CoupletQuery extends DictionaryPageQuery {
  /** 按上联原文精确查找已有配对，包含原始标点；不会生成新的下联。 */
  up?: string;
  /** 按下联原文精确反查上联。 */
  down?: string;
  /** 在上联和下联中搜索字面内容，不支持正则表达式。 */
  keyword?: string;
}
