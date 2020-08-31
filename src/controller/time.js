const Base = require('./base');
const { Solar, SolarUtil, LunarUtil } = require('lunar-javascript');

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);
    this.monthEnEnum = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.weekCnEnum = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    this.weekEnEnum = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  }

  async indexAction() {
    const { date, includeLunar, includeAlmanac } = this.get();

    const calcTime = date ? new Date(date) : new Date();
    const solarInstance = Solar.fromDate(calcTime);
    const lunarInstance = solarInstance.getLunar();

    const solarYear = solarInstance.getYear();
    const solarMonth = solarInstance.getMonth();
    const solarWeek = solarInstance.getWeek();
    const hour = calcTime.getHours();
    const minute = calcTime.getMinutes();

    const result = {
      year: solarYear, // 公历年
      leapYear: solarInstance.isLeapYear(), // 是否为闰年
      month: solarMonth, // 公历月
      maxDayInMonth: SolarUtil.getDaysOfMonth(solarYear, solarMonth), // 公历当月天数
      enMonth: this.monthEnEnum[solarMonth - 1], // 公历月（英文）
      astro: solarInstance.getXingZuo() + '座', // 星座
      cnWeek: this.weekCnEnum[solarWeek], // 星期（中文）
      enWeek: this.weekEnEnum[solarWeek], // 星期（英文）
      day: solarInstance.getDay(), // 公历日
      hour,
      minute,
      second: calcTime.getSeconds(),
      festivals: [...solarInstance.getFestivals(), ...solarInstance.getOtherFestivals()] // 公历节日
    };

    if (includeLunar) {
      const lunarYear = lunarInstance.getYear();
      const cnYear = lunarInstance.getYearInChinese();
      const lunarMonth = lunarInstance.getMonth();

      // 计算当月的二十四节气
      const solarTerms = [];
      const jieQiList = lunarInstance.getJieQiList();
      const jieQi = lunarInstance.getJieQiTable();
      for (let i = 0, j = jieQiList.length; i < j; i++) {
        const name = jieQiList[i];
        const time = jieQi[name].toYmdHms();
        if (jieQi[name].getMonth() === solarMonth) {
          solarTerms.push({ name, time });
        }
      }

      const lunar = {
        zodiac: lunarInstance.getYearShengXiao(), // 生肖
        year: lunarYear, // 农历年
        month: lunarMonth, // 农历月
        day: lunarInstance.getDay(), // 农历日
        cnYear: cnYear ? cnYear.replace(new RegExp('〇', 'g'), '零') : '', // 农历年（中文）
        cnMonth: lunarInstance.getMonthInChinese() + '月', // 农历月（中文）
        cnDay: lunarInstance.getDayInChinese(), // 农历日（中文）
        cyclicalYear: lunarInstance.getYearInGanZhi(), // 干支纪年
        cyclicalMonth: lunarInstance.getMonthInGanZhi(), // 干支纪月
        cyclicalDay: lunarInstance.getDayInGanZhi(), // 干支纪日
        hour: LunarUtil.convertTime(`${this.formatTwoDigit(hour)}:${this.formatTwoDigit(minute)}`) + '时', // 时辰
        maxDayInMonth: LunarUtil.getDaysOfMonth(lunarYear, lunarMonth), // 农历当月天数
        leapMonth: LunarUtil.getLeapMonth(lunarYear), // 当年闰几月
        yuexiang: lunarInstance.getYueXiang() + '月', // 月相
        festivals: lunarInstance.getFestivals(), // 农历节日
        solarTerms // 二十四节气
      };
      result.lunar = lunar;
    }

    if (includeAlmanac) {
      const almanac = {
        yi: {
          day: lunarInstance.getDayYi().join('.'), // 日宜
          time: lunarInstance.getTimeYi().join('.') // 时宜
        },
        ji: {
          day: lunarInstance.getDayJi().join('.'), // 日忌
          time: lunarInstance.getTimeJi().join('.') // 时忌
        },
        chong: {
          day: '生肖冲' + lunarInstance.getDayChongDesc(), // 日冲
          time: '生肖冲' + lunarInstance.getTimeChongDesc() // 时冲
        },
        sha: {
          day: '煞' + lunarInstance.getDaySha(), // 日煞
          time: '煞' + lunarInstance.getTimeSha() // 时煞
        },
        xingxiu: lunarInstance.getXiu() + '宿', // 二十八宿
        zheng: lunarInstance.getZheng(), // 七政
        pengzubaiji: [lunarInstance.getPengZuGan(), lunarInstance.getPengZuZhi()], // 彭祖百忌
        jishenfangwei: { // 吉神方位
          xi: lunarInstance.getDayPositionXiDesc(), // 喜神
          yanggui: lunarInstance.getDayPositionYangGuiDesc(), // 阳贵神
          yingui: lunarInstance.getDayPositionYinGuiDesc(), // 阴贵神
          fu: lunarInstance.getDayPositionFuDesc(), // 福神
          cai: lunarInstance.getDayPositionCaiDesc() // 财神
        },
        taishen: { // 胎神
          month: lunarInstance.getMonthPositionTai(),
          day: lunarInstance.getDayPositionTai()
        },
        nayin: { // 纳音
          year: lunarInstance.getYearNaYin(),
          month: lunarInstance.getMonthNaYin(),
          day: lunarInstance.getDayNaYin(),
          time: lunarInstance.getTimeNaYin()
        },
        shiershen: lunarInstance.getZhiXing() + '执神', // 建除十二执星
        festivals: lunarInstance.getOtherFestivals() // 老黄历节日
      };
      result.almanac = almanac;
    }

    return this.success(result);
  }

  /**
   * 格式化成两位数
   * @param {Number} val
   */
  formatTwoDigit(val) {
    return val < 10 ? '0' + val : val;
  }
};
