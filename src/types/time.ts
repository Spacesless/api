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
