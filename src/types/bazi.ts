export type FiveElement = '金' | '木' | '水' | '火' | '土';

export interface BaziQuery {
  /** 公历出生年，1900 至 2099。 */
  year: number;
  /** 公历出生月。 */
  month: number;
  /** 公历出生日，须为有效日期。 */
  day: number;
  /** 出生小时，0 至 23，按北京时间输入。 */
  hour: number;
  /** 出生分钟，默认 0；节气交接附近应提供准确分钟。 */
  minute?: number;
  /** 子时换日流派：1 为 23:00 换日，2（默认）为 00:00 换日；仅控制日柱及相关十神口径，时柱沿用库规则。 */
  sect?: 1 | 2;
  /** 通用黄历查询日期，YYYY-MM-DD，1900 至 2099；默认北京时间今天，与出生日期独立。 */
  date?: string;
}

export interface BaziHiddenStem {
  /** 藏干。 */
  stem: string;
  /** 藏干五行。 */
  element: FiveElement;
  /** 相对日主的十神。 */
  tenGod: string;
}

export interface BaziPillar {
  /** 干支，如：甲辰。 */
  ganZhi: string;
  /** 天干。 */
  stem: string;
  /** 地支。 */
  branch: string;
  /** 天干、地支本气五行，依次两个字，如：木土。 */
  elements: string;
  /** 纳音。 */
  naYin: string;
  /** 天干相对日主的十神，日柱为日主。 */
  tenGod: string;
  /** 地支藏干及其五行、十神，不计入表层五行统计。 */
  hiddenStems: BaziHiddenStem[];
}

export interface BaziResult {
  /** 北京时间出生时刻，YYYY-MM-DD HH:mm:ss。 */
  birth: string;
  /** 固定按北京时间的民用钟表时间排盘，不作真太阳时或历史夏令时换算。 */
  timeBasis: string;
  /** 排盘口径：立春分年、节气分月及子时日柱换日规则。 */
  rules: { yearBoundary: string; monthBoundary: string; sect: 1 | 2; dayBoundary: string };
  /** 依年、月、日、时排列的八字。 */
  eightChars: string;
  /** 四柱。 */
  pillars: { year: BaziPillar; month: BaziPillar; day: BaziPillar; hour: BaziPillar };
  /** 日主天干及五行。 */
  dayMaster: { stem: string; element: FiveElement };
  /** 表层八个字的五行统计，不计藏干、不加权，不代表旺衰或喜用神。 */
  fiveElements: {
    counts: Record<FiveElement, number>;
    missing: FiveElement[];
    basis: string;
  };
  /** 以农历正月初一分年的生肖。 */
  zodiac: string;
  /** 以立春交节时刻分年的八字年柱生肖。 */
  baziZodiac: string;
  /** 公历日期对应的星座。 */
  astro: string;
  /** 查询日期的通用黄历，不是个人运势。 */
  almanac: { date: string; yi: string[]; ji: string[] };
  /** 民俗娱乐说明。 */
  notice: string;
}
