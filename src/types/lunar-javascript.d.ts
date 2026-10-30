/** Declarations for the lunar-javascript APIs used by the time endpoints. */
declare module 'lunar-javascript' {
  interface NamedPeriod { getName(): string }
  interface NineStar { toString(): string }
  interface JieQi extends NamedPeriod { getSolar(): SolarDate }
  type LunarTextMethod = 'getYearInChinese' | 'getMonthInChinese' | 'getDayInChinese'
    | 'getYearShengXiao' | 'getYearInGanZhi' | 'getMonthInGanZhi' | 'getDayInGanZhi'
    | 'getYueXiang' | 'getWuHou' | 'getDayChongDesc' | 'getDaySha' | 'getDayNaYin'
    | 'getZhiXing' | 'getXiu' | 'getZheng' | 'getShou' | 'getPengZuGan' | 'getPengZuZhi'
    | 'getDayPositionXi' | 'getDayPositionXiDesc' | 'getDayPositionYangGui'
    | 'getDayPositionYangGuiDesc' | 'getDayPositionYinGui' | 'getDayPositionYinGuiDesc'
    | 'getDayPositionFu' | 'getDayPositionFuDesc' | 'getDayPositionCai' | 'getDayPositionCaiDesc'
    | 'getLiuYao' | 'getDayPositionTaiSui' | 'getDayPositionTaiSuiDesc'
    | 'getTimeChongDesc' | 'getTimeSha' | 'getTimeNaYin';
  type LunarTextMethods = { [K in LunarTextMethod]: () => string };
  interface LunarDate extends LunarTextMethods {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getFestivals(): string[];
    getOtherFestivals(): string[];
    getCurrentJieQi(): JieQi | null;
    getShuJiu(): NamedPeriod | null;
    getFu(): NamedPeriod | null;
    getDayNineStar(): NineStar;
    getTimeNineStar(): NineStar;
    getDayYi(): string[];
    getDayJi(): string[];
    getTimeYi(): string[];
    getTimeJi(): string[];
    getJieQiList(): string[];
    getJieQiTable(): Record<string, SolarDate>;
  }
  interface SolarDate {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getWeek(): number;
    getLunar(): LunarDate;
    isLeapYear(): boolean;
    getXingZuo(): string;
    getJulianDay(): number;
    getFestivals(): string[];
    getOtherFestivals(): string[];
    next(days: number): SolarDate;
    toString(): string;
    toYmdHms(): string;
  }
  interface Holiday {
    getName(): string;
    getTarget(): string;
    getDay(): string;
    isWork(): boolean;
  }
  export const Solar: {
    fromDate(date: Date): SolarDate;
    fromYmd(year: number, month: number, day: number): SolarDate;
  };
  export const SolarWeek: { fromDate(date: Date, start: number): { getIndexInYear(): number } };
  export const SolarUtil: {
    getDaysOfMonth(year: number, month: number): number;
    getDaysOfYear(year: number): number;
    getDaysInYear(year: number, month: number, day: number): number;
  };
  export const Lunar: { fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): LunarDate };
  export const LunarUtil: { convertTime(time: string): string };
  export const LunarYear: { fromYear(year: number): {
    getMonth(month: number): { _p: { dayCount: number } };
    getLeapMonth(): number;
  } };
  export const HolidayUtil: { getHolidays(year: number): Holiday[] };
}
