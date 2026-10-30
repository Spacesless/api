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
export interface EnglishSentence {
    _id: string;
    sid: string;
    /** 语音 */
    tts: string;
    /** 内容 */
    content: string;
    /** 翻译 */
    note: string;
    /** 笔记 */
    translation: string;
    /** 分享图片 */
    sharePicture: string | null;
    /** 说明文字 */
    caption: string;
    /** 图片 */
    picture: string;
    /** 中等图片 */
    middlePicture: string;
    /** 小图片 */
    smallPicture: string;
    /** 大图片 */
    largePicture: string | null;
    /** 日期 */
    date: string;
}
export interface EnglishSentenceQuery {
    /**
     * @description 日期，没传默认今天
     * @example 2025-04-15
     */
    date?: string | null;
}
export interface EnglishSentenceListQuery {
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
}
