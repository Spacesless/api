/** 古诗文数据，字段与 chinese-gushiwen 的 guwen 数据保持一致。 */
export interface Poem {
  /** MongoDB ObjectId，JSON 响应中为字符串。 */
  _id: string;
  /** 作品标题。 */
  title: string;
  /** 朝代，例如唐代、宋代。 */
  dynasty: string;
  /** 作者姓名；原始数据通过文字关联作者。 */
  writer: string;
  /** 原文，保留换行。 */
  content: string;
  /** 分类或标签。 */
  type: string[];
  /** 注释，部分作品没有该字段。 */
  remark?: string;
  /** 赏析。 */
  shangxi?: string;
  /** 译文。 */
  translation?: string;
}

/** 作者资料，detailIntro 保留原始字符串格式。 */
export interface PoetryWriter {
  _id: string;
  /** 姓名。 */
  name: string;
  /** 头像地址；没有头像时为空字符串。 */
  headImageUrl: string;
  /** 简介。 */
  simpleIntro: string;
  /** 详细介绍，原始数据通常是 JSON 编码的字符串。 */
  detailIntro: string;
}

/** 古诗文名句，不同于“一言”接口的数据。 */
export interface PoetrySentence {
  _id: string;
  /** 名句原文。 */
  name: string;
  /** 出处，例如“佚名《越人歌》”，不是作品 ID。 */
  from: string;
}

/** 三类查询统一返回分页结果。 */
export interface PoetryPageQuery {
  /** 页码，默认 1。 */
  page?: number;
  /** 每页条数，默认 10，最多 50。 */
  pageSize?: number;
}

export interface PoetryQuery extends PoetryPageQuery {
  /** 作者姓名，按字面内容模糊匹配；保留原接口的 author 参数名。 */
  author?: string;
  /** 朝代，精确匹配，例如唐代。 */
  dynasty?: string;
  /** 分类或标签，精确匹配，例如唐诗三百首。 */
  type?: string;
  /** 在标题、正文和分类中按字面内容搜索，不支持正则表达式。 */
  keyword?: string;
}

export interface PoetryWriterQuery extends PoetryPageQuery {
  /** 按姓名模糊查询。 */
  name?: string;
  /** 在姓名和简介中按字面内容搜索。 */
  keyword?: string;
}

export interface PoetrySentenceQuery extends PoetryPageQuery {
  /** 在名句原文和出处中按字面内容搜索。 */
  keyword?: string;
  /** 按出处模糊查询，例如李白或将进酒。 */
  from?: string;
}
