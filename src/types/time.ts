/** 星座详情。 */
export interface AstroInfo {
    /** 星座名称，如：摩羯座。 */
    name: string;
    /** 公历日期范围，如：12.22-1.19。 */
    range: string;
    /** 星座特点，如：执著现实。 */
    zxtd: string;
    /** 四象属性，如：土。 */
    sssx: string;
    /** 掌管宫位，如：第十宫。 */
    zggw: string;
    /** 阴阳属性，如：阴性。 */
    yysx: string;
    /** 最大特征，如：实际。 */
    zdtz: string;
    /** 主管星，如：土星。 */
    zgxx: string;
    /** 幸运颜色。 */
    xyys: string;
    /** 吉祥饰物。 */
    jssw: string;
    /** 幸运号码。 */
    xyhm: string;
    /** 开运金属。 */
    kyjs: string;
    /** 表现。 */
    bx: string;
    /** 优点。 */
    yd: string;
    /** 缺点。 */
    qd: string;
    /** 基本特质。 */
    jbtz: string;
    /** 具体特质。 */
    jttz: string;
    /** 行事风格。 */
    xsfg: string;
    /** 个性盲点。 */
    gxmd: string;
    /** 总结。 */
    zj: string;
}
/** 星座查询结果，未匹配到星座时为空对象。 */
export interface AstroResult extends Partial<AstroInfo> {}
/** 星座信息与日期区间配置。 */
export interface AstroData {
    /** 以星座名称为键的星座详情。 */
    role: Record<string, AstroInfo>;
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
/** 二十四节气。 */
export interface TimeJieqi {
    /** 节气名称。 */
    name: string;
    /** 交节时间，格式：YYYY-MM-DD HH:mm:ss。 */
    time: string;
}
/** 当天的节气，当天不是节气时为空对象。 */
export interface TimeSolarTerm {
    /** 节气名称。 */
    name?: string;
    /** 交节时间，格式：YYYY-MM-DD HH:mm:ss。 */
    time?: string;
}
/** 公历信息。 */
export interface TimeSolarInfo {
    /** 公历年。 */
    year: number;
    /** 是否为闰年。 */
    leapYear: boolean;
    /** 公历月。 */
    month: number;
    /** 公历当月天数。 */
    maxDayInMonth: number;
    /** 英文月份，如：October。 */
    enMonth: string;
    /** 星座，如：天蝎座。 */
    astro: string;
    /** 中文星期，如：星期五。 */
    cnWeek: string;
    /** 英文星期，如：Friday。 */
    enWeek: string;
    /** 当年第几周，周一为一周的第一天。 */
    weekInYear: number;
    /** 公历日。 */
    day: number;
    /** 当年第几天。 */
    dayInYear: number;
    /** 儒略日。 */
    julianDay: number;
    /** 时。 */
    hour: number;
    /** 分。 */
    minute: number;
    /** 秒。 */
    second: number;
    /** 当天的公历、农历节日及其他纪念日。 */
    festivals: string[];
}
/** 农历信息。 */
export interface TimeLunarInfo {
    /** 生肖。 */
    zodiac: string;
    /** 农历年。 */
    year: number;
    /** 农历月，闰月为负数。 */
    month: number;
    /** 农历日。 */
    day: number;
    /** 中文农历年，如：二零二六。 */
    cnYear: string;
    /** 中文农历月，如：九月。 */
    cnMonth: string;
    /** 中文农历日，如：廿一。 */
    cnDay: string;
    /** 干支纪年。 */
    cyclicalYear: string;
    /** 干支纪月。 */
    cyclicalMonth: string;
    /** 干支纪日。 */
    cyclicalDay: string;
    /** 时辰，如：子时。 */
    hour: string;
    /** 农历当月天数。 */
    maxDayInMonth: number;
    /** 当年闰几月，无闰月时为 0。 */
    leapMonth: number;
    /** 月相。 */
    yuexiang: string;
    /** 物候。 */
    wuhou: string;
    /** 数九，如：一九，不在数九期间为空字符串。 */
    shujiu: string;
    /** 三伏，如：中伏，不在三伏期间为空字符串。 */
    sanfu: string;
    /** 当天的二十四节气。 */
    solarTerms: TimeSolarTerm;
}
/** 吉神方位，格式：方位卦名-方向。 */
export interface TimeJishenFangwei {
    /** 喜神。 */
    xi: string;
    /** 阳贵神。 */
    yanggui: string;
    /** 阴贵神。 */
    yingui: string;
    /** 福神。 */
    fu: string;
    /** 财神。 */
    cai: string;
}
/** 老黄历信息。 */
export interface TimeAlmanac {
    /** 宜，多项以空格分隔。 */
    yi: string;
    /** 忌，多项以空格分隔。 */
    ji: string;
    /** 冲，如：生肖冲(丁卯)兔。 */
    chong: string;
    /** 煞，如：煞东。 */
    sha: string;
    /** 纳音。 */
    nayin: string;
    /** 建除十二执星。 */
    shiershen: string;
    /** 二十八宿。 */
    xingxiu: string;
    /** 七政。 */
    zheng: string;
    /** 四神兽。 */
    shou: string;
    /** 彭祖百忌，依次为天干、地支忌讳。 */
    pengzubaiji: string[];
    /** 吉神方位。 */
    jishenfangwei: TimeJishenFangwei;
    /** 六曜。 */
    liuyao: string;
    /** 九星。 */
    jiuxing: string;
    /** 太岁方位，格式：方位卦名-方向。 */
    taisui: string;
}
/** 万年历信息。 */
export interface TimeInfo extends TimeSolarInfo {
    /** 农历信息。 */
    lunar: TimeLunarInfo;
    /** 老黄历信息。 */
    almanac: TimeAlmanac;
}
/** 时辰黄历信息。 */
export interface TimeShichen {
    /** 公历日期，格式：YYYY-M-D。 */
    date: string;
    /** 时辰对应的时间段，如：23:00-00:59。 */
    hours: string;
    /** 时辰，如：子时。 */
    hour: string;
    /** 时宜，多项以空格分隔。 */
    yi: string;
    /** 时忌，多项以空格分隔。 */
    ji: string;
    /** 时冲。 */
    chong: string;
    /** 时煞。 */
    sha: string;
    /** 纳音。 */
    nayin: string;
    /** 九星。 */
    jiuxing: string;
}
/** 节日信息。 */
export interface TimeFestival {
    /** 月份，如：10。 */
    month: string;
    /** 英文月份缩写，如：Oct。 */
    monthEn: string;
    /** 公历日期，格式：YYYY-MM-DD。 */
    day: string;
    /** 农历日期，如：二〇二六年九月廿一。 */
    cnDay: string;
    /** 节日名称。 */
    name: string;
    /** 距今天数，已过去时为负数。 */
    distance: number;
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
export interface TimeQuery {
    /**
     * @description 查询指定时间信息，不传取当前时间
     * @example 2020-10-01
     */
    datetime?: string;
}
export interface TimeAstroQuery {
    /** @description 查找日期或星座名称：如1900年起始 2022-01-01 或 天秤(座)、水瓶(座) */
    keyword?: string;
}
export interface TimeShichenQuery {
    /**
     * @description 查询指定日期时辰信息，不传取当天
     * @example 2020-10-01
     */
    date?: string;
}
export interface TimeJieqiQuery {
    /**
     * @description 公历年：2020
     * @example
     */
    year?: string;
    /** @description 月份 */
    month?: number;
}
export interface TimeFestivalQuery {
    /**
     * @description 年份
     * @example 2025
     */
    year?: number;
    /**
     * @description 月份
     * @example 10
     */
    month?: number;
}
export interface TimeHolidayQuery {
    /**
     * @description 年份
     * @example 2025
     */
    year?: number;
}
