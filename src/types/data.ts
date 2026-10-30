import type { components, paths } from './openapi';

/** 从 OpenAPI 文档提取指定 GET 接口的查询参数类型。 */
export type ApiQuery<P extends keyof paths> = paths[P] extends {
  get: {
    parameters: {
      query?: infer Q;
    };
  };
} ? NonNullable<Q> : Record<string, never>;

/** 从 OpenAPI 文档提取指定 GET 接口的 HTTP 200 JSON 响应类型。 */
export type ApiResponse<P extends keyof paths> = paths[P] extends {
  get: {
    responses: {
      200: {
        content: {
          'application/json': infer R;
        };
      };
    };
  };
} ? R : unknown;

/** 每日英语的公开响应数据类型。 */
export type EnglishSentence = components['schemas']['EnglishSentence'];

/** 一言的公开响应数据类型。 */
export type Sentence = components['schemas']['Sentence'];

/** 笑话的公开响应数据类型。 */
export type Joke = components['schemas']['Joke'];

/** Bing 壁纸的公开响应数据类型。 */
export type BingImage = components['schemas']['BingImage'];

/** 数字查询参数：原始请求可能为字符串，Logic 校验后可能转换为数字。 */
export type NumericQuery = number | string;

/** 分页查询参数。 */
export interface PaginationQuery {

/** 页码；默认值由现有查询逻辑处理。 */
  page?: NumericQuery;
  /** 每页记录数。 */
  pageSize?: NumericQuery;
}

/** 一言查询条件。 */
export interface SentenceQuery extends PaginationQuery {

/** 一言分类，多个分类使用英文逗号分隔。 */
  type?: string;
  /** 句子最小长度。 */
  minLength?: NumericQuery;
  /** 句子最大长度。 */
  maxLength?: NumericQuery;
}

/** 笑话查询条件。 */
export interface JokeQuery extends PaginationQuery {

/** 笑话类型，如反转、谐音、谐义或其他。 */
  type?: string;
  /** 幽默等级，现有接口支持 1 和 5。 */
  level?: NumericQuery;
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

/** 金山词霸上游响应；主接口和备用接口的字段可能不同。 */
export interface IcibaResponse {

/** 备用接口的业务状态码，0 表示成功；原接口可能不返回此字段。 */
  errno?: number;
  /** 每日一句 ID；不同接口可能返回字符串或数字。 */
  sid?: string | number;
  /** 备用接口的句子日期，格式为 YYYY-MM-DD。 */
  title?: string;
  /** 原接口的句子日期，格式为 YYYY-MM-DD。 */
  dateline?: string;
  /** 英文原句。 */
  content?: string;
  /** 中文翻译。 */
  note?: string;
  /** 词霸小编说明或笔记，区别于中文翻译 note。 */
  translation?: string;
  /** 默认配图地址。 */
  picture?: string;
  /** 入库时映射为 middlePicture 的配图地址。 */
  picture2?: string;
  /** 入库时映射为 smallPicture 的配图地址。 */
  picture3?: string;
  /** 入库时映射为 largePicture 的大图地址，备用接口可能缺失。 */
  picture4?: string | null;
  /** 合成分享图地址，入库时映射为 sharePicture。 */
  fenxiang_img?: string | null;
  /** 内容标题，如“词霸每日一句”。 */
  caption?: string;
  /** 句子朗读音频地址。 */
  tts?: string;
}

/** 通过必要字段校验并完成格式转换的每日英语采集数据。 */
export interface IcibaSentence extends IcibaResponse {

/** 统一转换为字符串的句子 ID。 */
  sid: string;
  /** 统一后的句子日期，入库时映射为 date。 */
  dateline: string;
  /** 已校验为非空字符串的英文原句。 */
  content: string;
  /** 已校验为非空字符串的中文翻译。 */
  note: string;
  /** 分享图地址，缺失时统一为 null。 */
  fenxiang_img: string | null;
  /** 大图地址，缺失时统一为 null。 */
  picture4: string | null;
}

/** Bing 壁纸接口返回的原始图片数据。 */
export interface BingSourceImage {

/** 壁纸标题。 */
  title: string;
  /** 版权和拍摄说明。 */
  copyright: string;
  /** 上游返回的图片地址，可能为相对路径。 */
  url: string;
  /** 不含分辨率后缀的图片路径，用于拼接不同尺寸地址。 */
  urlbase: string;
  /** 上游日期，格式为 YYYYMMDD，入库时转换为 time。 */
  enddate: string;
}

/** Bing 壁纸入库记录。 */
export interface BingRecord {

/** 壁纸标题。 */
  title: string;
  /** 版权和拍摄说明。 */
  copyright: string;
  /** 图片地址，返回时可按尺寸重新拼接。 */
  url: string;
  /** 用于生成不同分辨率地址的图片基础路径。 */
  urlbase: string;
  /** 壁纸日期，格式为 YYYY-MM-DD。 */
  time: string;
}

/** 行政区划级联节点。 */
export interface DistrictNode {

/** 当前行政区划编码。 */
  code: string;
  /** 行政区划名称。 */
  name: string;
  /** 所属省级行政区编码。 */
  provinceCode?: string;
  /** 所属地级行政区编码。 */
  cityCode?: string;
  /** 所属县级行政区编码。 */
  areaCode?: string;
  /** 下级行政区划节点，末级节点可不包含此字段。 */
  children?: DistrictNode[];
}

/** 国家或地区的电话区号信息。 */
export interface AreaCode {
  /** 国家或地区名称。 */
  name: string;
  /** 国际电话区号。 */
  phoneCode: string;
}

/** 常用电话号码信息。 */
export interface PhoneNumber {
  /** 电话号码分类。 */
  cate: string;
  /** 机构或服务名称。 */
  name: string;
  /** 电话号码，使用字符串保留格式。 */
  tel: string;
}

/** 番组数据源中的动画条目。 */
export interface BangumiItem {

/** 开播时间，供年份和月份筛选使用。 */
  begin: string;
  /** 番组原始标题。 */
  title: string;
  /** 按语言分组的译名列表。 */
  titleTranslate: Record<string, string[]>;
  /** 保留数据源中的其他字段，不在此处假设其具体结构。 */
  [key: string]: unknown;
}

/** 碧蓝航线舰船资源数据。 */
export interface Ship {

/** 舰船资源 ID。 */
  id: string;
  /** 舰船分组 ID，用于关联皮肤配置。 */
  _gid?: number;
  /** 上游舰种名称，返回时可转换为中文。 */
  hullType: string;
  /** 不同语言的舰船名称，至少包含中文名 cn。 */
  names: Record<string, string> & {
    /** 舰船中文名称。 */
    cn: string;
  };
  /** 上游阵营名称，返回时可转换为中文。 */
  nationality: string;
  /** 上游稀有度名称，返回时可转换为中文。 */
  rarity: string;
  /** 舰船缩略图地址。 */
  thumbnail: string;
  /** 舰船级别或分类。 */
  class: string;
  /** 保留数据源中的其他字段，不在此处假设其具体结构。 */
  [key: string]: unknown;
}

/** 舰船皮肤配置。 */
export interface ShipSkin {
  /** 立绘资源名，用于匹配 Spine 资源目录。 */
  painting: string;
  /** 所属舰船分组 ID，对应舰船的 _gid。 */
  ship_group: number;
  /** 皮肤名称。 */
  name: string;
}

/** Spine 模型资源地址。 */
export interface SpineResult {

/** 纹理图集描述文件地址。 */
  atlas: string;
  /** 纹理图片地址。 */
  texture: string;
  /** 二进制骨骼文件地址，文件存在时返回。 */
  skelBinary?: string;
  /** JSON 骨骼文件地址，文件存在时返回。 */
  skelJson?: string;
}

/** Live2D 模型目录条目或分组节点。 */
export interface Live2dEntry {

/** 模型条目或分组 ID。 */
  id: number;
  /** 展示名称。 */
  name: string;
  /** 资源目录配置中的路径标记。 */
  path?: string;
  /** 单个模型目录，或可切换的多个模型目录。 */
  models: string | string[];
  /** 模型附带的展示信息。 */
  message?: string;
  /** 模型来源说明。 */
  from?: string;
  /** 分组下的模型条目。 */
  children?: Live2dEntry[];
}

/** Live2D 模型配置，资源地址可由 Controller 转换。 */
export interface Live2dModel {

/** MOC 模型文件路径。 */
  model: string;
  /** 纹理文件地址列表；未找到材质时可能为 undefined。 */
  textures: string[] | undefined;
  /** 姿势配置文件路径。 */
  pose?: string;
  /** 物理效果配置文件路径。 */
  physics?: string;
  /** 音频资源路径。 */
  sounds?: string;
  /** 动作组配置，保留原始 JSON 结构。 */
  motions?: unknown;
  /** 表情组配置，保留原始 JSON 结构。 */
  expressions?: unknown;
  /** 保留数据源中的其他字段，不在此处假设其具体结构。 */
  [key: string]: unknown;
}

/** 一套材质配置：单个文件，或需要一起加载的多个文件。 */
export type TextureList = string | string[];

/** 星座信息与日期区间配置。 */
export interface AstroData {

/** 以星座名称为键的星座详情。 */
  role: Record<string, unknown>;
  /** 各星座对应的公历日期区间。 */
  monthRange: {
    /** 区间起始月日，与查询年份拼接后参与比较。 */
    start: string;
    /** 区间结束月日，与查询年份拼接后参与比较。 */
    end: string;
    /** 用于查找 role 的星座名称。 */
    name: string;
  }[];
}

/** 按节日名称汇总的假期和调休信息。 */
export interface HolidayRecord {

/** 节日名称。 */
  name?: string;
  /** 假期开始日期。 */
  start?: string;
  /** 假期结束日期。 */
  end?: string;
  /** 距离节日目标日期的天数，已过去时可为负数。 */
  distance?: number;
  /** 假期总天数，包含首尾日期。 */
  length?: number;
  /** 剩余假期天数，按现有日期计算逻辑返回。 */
  balance?: number;
  /** 与该节日关联的调休工作日期列表。 */
  work?: string[];
}

/** QQ 音乐歌手信息。 */
export interface TencentSinger {
  /** 歌手数字 ID。 */
  id: number;
  /** 歌手名称。 */
  name: string;
}

/** QQ 音乐歌单中的歌曲信息。 */
export interface TencentSong {

/** 专辑说明。 */
  albumdesc: string;
  /** 专辑 MID，用于拼接封面地址。 */
  albummid: string;
  /** 专辑名称。 */
  albumname: string;
  /** 歌曲时长，单位为秒。 */
  interval: number;
  /** 上游播放状态码，现有逻辑结合付费标记判断是否免费。 */
  msgid: number;
  /** 上游付费标记，字段名随接口有所不同。 */
  pay: {
    /** 歌单接口的播放付费标记，现有逻辑将 0 视为免费。 */
    payplay: number;
    /** 其他上游返回结构中的播放付费标记。 */
    pay_play: number;
  };
  /** 歌曲的歌手列表。 */
  singer: TencentSinger[];
  /** 歌曲 MID。 */
  songmid: string;
  /** 歌曲名称。 */
  songname: string;
}

/** QQ 音乐歌单详情。 */
export interface TencentCd {

/** 歌单创建者昵称。 */
  nickname: string;
  /** 歌单 ID。 */
  disstid: string;
  /** 歌单名称。 */
  dissname: string;
  /** 歌单封面地址。 */
  logo: string;
  /** 歌单描述。 */
  desc: string;
  /** 歌单标签列表。 */
  tags: {
    /** 标签 ID。 */
    id: number;
    /** 标签名称。 */
    name: string;
  }[];
  /** 歌单歌曲总数。 */
  songnum: number;
  /** 歌单中的歌曲列表。 */
  songlist: TencentSong[];
  /** 歌单访问或播放统计值。 */
  visitnum: number;
}

/** QQ 音乐搜索结果中的歌曲信息。 */
export interface TencentSearchSong {

/** 歌曲所属专辑信息。 */
  album: {
    /** 专辑 MID，用于生成封面地址。 */
    mid: string;
    /** 专辑名称。 */
    name: string;
    /** 专辑副标题。 */
    subtitle: string;
  };
  /** 歌曲时长，单位为秒。 */
  interval: number;
  /** 歌曲名称。 */
  name: string;
  /** 歌曲 MID。 */
  mid: string;
  /** 歌手列表。 */
  singer: TencentSinger[];
  /** 歌曲付费信息。 */
  pay: {
    /** 播放付费标记，现有逻辑将 0 视为免费。 */
    pay_play: number;
  };
}

/** QQ 音乐搜索接口响应。 */
export interface TencentSearchResponse {

/** 批量请求中搜索子请求的返回结果。 */
  req_0?: {
    /** 搜索子请求的数据。 */
    data: {
      /** 搜索结果主体。 */
      body?: {
        /** 歌曲搜索结果分组。 */
        song: {
          /** 匹配到的歌曲列表。 */
          list: TencentSearchSong[];
        };
      };
      /** 搜索结果统计信息。 */
      meta?: {
        /** 匹配到的歌曲总数。 */
        sum: number;
      };
    };
  };
}

/** QQ 音乐用户歌单列表接口响应。 */
export interface TencentCdListResponse {

/** 用户歌单数据。 */
  data: {
  /** 用户 QQ 号码。 */
    hostuin: number;
    /** 用户昵称。 */
    hostname: string;
    /** 上游返回的歌单总数；保留上游字段的拼写。 */
    totoal: number;
    /** 用户歌单列表。 */
    disslist: {
      /** 歌单 ID。 */
      tid: number;
      /** 歌单名称。 */
      diss_name: string;
      /** 歌单封面地址。 */
      diss_cover: string;
      /** 歌单歌曲数量。 */
      song_cnt: number;
      /** 歌单收听统计值。 */
      listen_num: number;
    }[];
  };
}
