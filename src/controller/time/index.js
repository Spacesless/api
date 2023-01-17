const Base = require('../base');
const { Solar, Lunar, SolarUtil, LunarUtil, LunarYear } = require('lunar-javascript');

// http://6tail.cn/calendar/api.html

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);
    this.monthEnEnum = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.weekCnEnum = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    this.weekEnEnum = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.solarTermEnum = {
      'DA_XUE': '大雪',
      'DONG_ZHI': '冬至',
      'XIAO_HAN': '小寒',
      'DA_HAN': '大寒'
    };
  }

  indexAction() {
    const { datetime } = this.get();

    const calcTime = datetime ? new Date(datetime) : new Date();
    const solarInstance = Solar.fromDate(calcTime);
    const lunarInstance = solarInstance.getLunar();

    // 阳历
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

    // 农历
    const lunarYear = lunarInstance.getYear();
    const cnYear = lunarInstance.getYearInChinese();
    const lunarMonth = lunarInstance.getMonth();

    const lunarYearInstance = LunarYear.fromYear(lunarYear);

    // 计算当月的二十四节气
    const solarTerms = [];
    const jieQiList = lunarInstance.getJieQiList();
    const jieQi = lunarInstance.getJieQiTable();
    for (let i = 0, j = jieQiList.length; i < j; i++) {
      let name = jieQiList[i];
      const time = jieQi[name].toYmdHms();
      if (jieQi[name].getYear() === solarYear && jieQi[name].getMonth() === solarMonth) {
        name = this.solarTermEnum[name] || name;
        solarTerms.push({ name, time });
      }
    }

    result.lunar = {
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
      maxDayInMonth: lunarYearInstance.getMonth(lunarMonth)['_p'].dayCount, // 农历当月天数
      leapMonth: lunarYearInstance.getLeapMonth(lunarYear), // 当年闰几月
      festivals: lunarInstance.getFestivals(), // 农历节日
      solarTerms // 二十四节气
    };

    // 老黄历
    result.almanac = {
      yi: {
        day: lunarInstance.getDayYi().join(' '), // 日宜
        hour: lunarInstance.getTimeYi().join(' ') // 时宜
      },
      ji: {
        day: lunarInstance.getDayJi().join(' '), // 日忌
        hour: lunarInstance.getTimeJi().join(' ') // 时忌
      },
      chong: {
        day: '生肖冲' + lunarInstance.getDayChongDesc(), // 日冲
        hour: '生肖冲' + lunarInstance.getTimeChongDesc() // 时冲
      },
      sha: {
        day: '煞' + lunarInstance.getDaySha(), // 日煞
        hour: '煞' + lunarInstance.getTimeSha() // 时煞
      },
      xingxiu: lunarInstance.getXiu() + '宿', // 二十八宿
      zheng: lunarInstance.getZheng(), // 七政
      shou: lunarInstance.getShou(), // 四神兽
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
      shiershen: lunarInstance.getZhiXing() + '神', // 建除十二执星
      festivals: lunarInstance.getOtherFestivals() // 老黄历节日
    };

    return this.success(result);
  }

  // 时辰黄历信息
  shichenAction() {
    const { date } = this.get();

    const calcTime = date ? new Date(date) : new Date();
    const solarInstance = Solar.fromDate(calcTime);
    const lunarInstance = solarInstance.getLunar();

    // 公历
    const solarYear = solarInstance.getYear();
    const solarMonth = solarInstance.getMonth();

    // 农历
    const lunarYear = lunarInstance.getYear();
    const lunarMonth = lunarInstance.getMonth();
    const lunarDay = lunarInstance.getDay();

    const result = [];
    for (let i = 0; i < 24; i += 2) {
      const middleHour = i + 2 >= 24 ? 24 - (i + 2) : i + 2;
      const lunarInstance = Lunar.fromYmdHms(lunarYear, lunarMonth, lunarDay, middleHour, 0, 0);

      const row = {
        date: `${solarYear}-${solarMonth}-${solarInstance.getDay()}`,
        hours: `${this.formatTwoDigit(i + 1)}:00-${this.formatTwoDigit(middleHour)}:59`,
        hour: LunarUtil.convertTime(`${this.formatTwoDigit(middleHour)}:00`) + '时', // 时辰
        yi: lunarInstance.getTimeYi().join(' '), // 时宜
        ji: lunarInstance.getTimeJi().join(' '), // 时忌
        chong: '生肖冲' + lunarInstance.getTimeChongDesc(), // 时冲,
        sha: '煞' + lunarInstance.getTimeSha(), // 时煞
        nayin: lunarInstance.getTimeNaYin(), // 纳音
        jiuxing: lunarInstance.getTimeNineStar().toString() // 九星
      };
      result.push(row);
    }

    result.unshift(result.pop()); // 将子时提前
    return this.success(result);
  }

  // 二十四节气
  jieqiAction() {
    const { year, month } = this.get();

    const calcTime = year ? new Date(`${year}-01-01`) : new Date();
    const solarInstance = Solar.fromDate(calcTime);
    const lunarInstance = solarInstance.getLunar();

    const result = [];
    const jieQiList = lunarInstance.getJieQiList();
    const jieQi = lunarInstance.getJieQiTable();
    for (let i = 0, j = jieQiList.length; i < j; i++) {
      let name = jieQiList[i];
      const time = jieQi[name].toYmdHms();
      if (month) { // 查询指定月份的节气
        if (jieQi[name].getYear() === year && jieQi[name].getMonth() === +month) {
          name = this.solarTermEnum[name] || name;
          result.push({ name, time });
        }
      } else { // 查询全部的节气
        name = this.solarTermEnum[name] || name;
        result.push({ name, time });
      }
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
