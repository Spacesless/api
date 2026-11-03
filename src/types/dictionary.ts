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

/** 谜语分类编码。 */
export enum RiddleCategory {
  /** 脑筋急转弯。 */
  BrainTeaser = 'brainTeaser',
  /** 智力问答。 */
  Intelligence = 'intelligence',
  /** 谜语详解。 */
  Explanation = 'explanation',
  /** 搞笑谜语。 */
  Funny = 'funny',
  /** 字谜。 */
  Character = 'character',
  /** 成语谜语。 */
  Idiom = 'idiom',
  /** 动物谜语。 */
  Animal = 'animal',
  /** 爱情谜语。 */
  Love = 'love',
  /** 灯谜。 */
  Lantern = 'lantern',
  /** 人名谜语。 */
  Person = 'person',
  /** 地名谜语。 */
  Place = 'place',
  /** 词语谜语。 */
  Word = 'word',
  /** 带格谜语。 */
  Pattern = 'pattern',
  /** 用语谜语。 */
  Phrase = 'phrase',
  /** 儿童谜语。 */
  Children = 'children',
  /** 物品谜语。 */
  Object = 'object',
  /** 植物谜语。 */
  Plant = 'plant',
  /** 诗词谜语。 */
  Poetry = 'poetry',
  /** 书报谜语。 */
  Publication = 'publication',
  /** 俗语谜语。 */
  Saying = 'saying',
  /** 药品谜语。 */
  Medicine = 'medicine',
  /** 音乐谜语。 */
  Music = 'music',
  /** 影视谜语。 */
  Film = 'film',
  /** 称谓谜语。 */
  Appellation = 'appellation',
  /** 趣味谜语。 */
  Other = 'other'
}

/** 谜语记录；导入文件不含 _id，由 MongoDB 自动生成。 */
export interface Riddle {
  _id: string;
  /** 谜面，不包含末尾谜目。 */
  question: string;
  /** 谜目，如：打一字；没有时为空字符串。 */
  guess: string;
  /** 谜底，保留原始答案及标点。 */
  answer: string;
  /** 分类编码，如：character（字谜）、idiom（成语谜语）、brainTeaser（脑筋急转弯）。 */
  category: RiddleCategory;
  /** 中文分类名称。 */
  categoryName: string;
  /** 小贴士，没有时为空字符串。 */
  hint: string;
  /** 详细解析，没有时为空字符串。 */
  explanation: string;
}

export interface RiddleQuery {
  /** 按分类编码精确筛选，如：character；使用小驼峰英文枚举值。 */
  category?: RiddleCategory;
  /** 按谜面包含的文字查询，特殊符号按字面匹配。 */
  question?: string;
  /** 按谜目包含的文字查询，如：打一字。 */
  guess?: string;
  /** 按谜底包含的文字反查。 */
  answer?: string;
  /** 同时搜索谜面、谜目和谜底；与其他条件组合筛选。 */
  keyword?: string;
  /** 页码，默认 1。 */
  page?: number;
  /** 每页条数，默认 10，最多 50。 */
  pageSize?: number;
}
