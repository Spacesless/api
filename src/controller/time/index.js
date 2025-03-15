const Base = require('../base');
const { Solar, SolarWeek, Lunar, SolarUtil, LunarUtil, LunarYear, HolidayUtil } = require('lunar-javascript');
const dayjs = require('dayjs');

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
    const solarWeekInstance = SolarWeek.fromDate(calcTime, 1);
    const lunarInstance = solarInstance.getLunar();

    // 阳历
    const solarYear = solarInstance.getYear();
    const solarMonth = solarInstance.getMonth();
    const solarWeek = solarInstance.getWeek();
    const solarDay = solarInstance.getDay();
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
      weekInYear: solarWeekInstance.getIndexInYear(),
      day: solarDay, // 公历日
      dayInYear: SolarUtil.getDaysInYear(solarYear, solarMonth, solarDay),
      julianDay: solarInstance.getJulianDay(),
      hour,
      minute,
      second: calcTime.getSeconds(),
      festivals: [
        ...solarInstance.getFestivals(),
        ...lunarInstance.getFestivals(),
        ...solarInstance.getOtherFestivals(),
        ...lunarInstance.getOtherFestivals()
      ] // 节日
    };

    // 农历
    const lunarYear = lunarInstance.getYear();
    const cnYear = lunarInstance.getYearInChinese();
    const lunarMonth = lunarInstance.getMonth();

    const lunarYearInstance = LunarYear.fromYear(lunarYear);

    // 计算当天的二十四节气
    let solarTerms = {};
    const jieQi = lunarInstance.getCurrentJieQi();
    if (jieQi) {
      solarTerms = {
        name: jieQi.getName(),
        time: jieQi.getSolar().toYmdHms()
      };
    }

    const shujiu = lunarInstance.getShuJiu();

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
      yuexiang: lunarInstance.getYueXiang(), // 月相
      wuhou: lunarInstance.getWuHou(), // 物候
      shujiu: shujiu ? shujiu.getName() : '', // 数九
      sanfu: lunarInstance.getFu() || '', // 三伏
      solarTerms // 二十四节气
    };

    const jiuxing = lunarInstance.getDayNineStar();

    // 老黄历
    result.almanac = {
      yi: lunarInstance.getDayYi().join(' '), // 宜,
      ji: lunarInstance.getDayJi().join(' '), // 忌,
      chong: '生肖冲' + lunarInstance.getDayChongDesc(), // 冲,
      sha: '煞' + lunarInstance.getDaySha(), // 煞,
      nayin: lunarInstance.getDayNaYin(), // 纳音
      shiershen: lunarInstance.getZhiXing() + '神', // 建除十二执星
      xingxiu: lunarInstance.getXiu() + '宿', // 二十八宿
      zheng: lunarInstance.getZheng(), // 七政
      shou: lunarInstance.getShou(), // 四神兽
      pengzubaiji: [lunarInstance.getPengZuGan(), lunarInstance.getPengZuZhi()], // 彭祖百忌
      jishenfangwei: { // 吉神方位
        xi: lunarInstance.getDayPositionXi() + '-' + lunarInstance.getDayPositionXiDesc(), // 喜神
        yanggui: lunarInstance.getDayPositionYangGui() + '-' + lunarInstance.getDayPositionYangGuiDesc(), // 阳贵神
        yingui: lunarInstance.getDayPositionYinGui() + '-' + lunarInstance.getDayPositionYinGuiDesc(), // 阴贵神
        fu: lunarInstance.getDayPositionFu() + '-' + lunarInstance.getDayPositionFuDesc(), // 福神
        cai: lunarInstance.getDayPositionCai() + '-' + lunarInstance.getDayPositionCaiDesc() // 财神
      },
      liuyao: lunarInstance.getLiuYao(),
      jiuxing: jiuxing ? jiuxing.toString() : '',
      taisui: lunarInstance.getDayPositionTaiSui() + '-' + lunarInstance.getDayPositionTaiSuiDesc()
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
   * 节日大全
   */
  festivalAction() {
    const { year, month } = this.get();

    const nowTime = dayjs();
    const solarYear = dayjs(year).year();
    const maxDays = month ? SolarUtil.getDaysOfMonth(solarYear, month) : SolarUtil.getDaysOfYear(solarYear);

    const start = Solar.fromYmd(solarYear, month || 1, 1);
    const result = [];

    for (let i = 0; i < maxDays; i++) {
      const solarInstance = start.next(i);
      const lunarInstance = solarInstance.getLunar();

      const festivals = [
        ...solarInstance.getFestivals(),
        ...lunarInstance.getFestivals(),
        ...solarInstance.getOtherFestivals(),
        ...lunarInstance.getOtherFestivals()
      ];

      if (festivals.length > 0) {
        const day = solarInstance.toString();
        const dayjsInstance = dayjs(day);
        const month = dayjsInstance.format('M');
        const monthEn = dayjsInstance.format('MMM');

        festivals.forEach((item) => {
          const row = {
            month,
            monthEn,
            day: dayjsInstance.format('YYYY-MM-DD'),
            cnDay: `${lunarInstance.getYearInChinese()}年${lunarInstance.getMonthInChinese()}月${lunarInstance.getDayInChinese()}`,
            name: item,
            distance: dayjsInstance.diff(nowTime, 'd')
          };

          result.push(row);
        });
      }
    }

    return this.success(result);
  }

  /**
   * 法定节假日
   */
  holidayAction() {
    const { year } = this.get();
    const solarYear = dayjs(year).year();

    const holidays = HolidayUtil.getHolidays(solarYear);
    const result = {};

    holidays.forEach((holiday) => {
      const name = holiday.getName();
      const target = holiday.getTarget();
      const isWork = holiday.isWork();
      const day = holiday.getDay();

      result[name] = result[name] || {};

      if (!isWork && dayjs(target).year() === solarYear) {
        const distance = dayjs(target).diff(dayjs().startOf('day'), 'day');
        const start = result[name]?.start || day;
        result[name] = {
          name,
          start,
          end: day,
          distance,
          length: this.getLength(start, day),
          balance: this.getBalance(start, day)
        };
      }

      result[name].work = isWork ? [...(result[name]?.work || []), day] : [];
    });

    return this.success(Object.values(result));
  }

  /**
   * 格式化成两位数
   * @param {Number} val
   * @returns {String}
   */
  formatTwoDigit(val) {
    return val.toString().padStart(2, '0');
  }

  /**
   * 获取假期长度
   * @param {string} start 开始日期
   * @param {string} end 结束日期
   * @returns {number}
   */
  getLength(start, end) {
    const startDay = dayjs(start);
    const endDay = dayjs(end);

    return endDay.diff(startDay, 'day') + 1;
  }

  /**
   * 获取假期余额
   * @param {string} start 开始日期
   * @param {string} end 结束日期
   * @returns {number}
   */
  getBalance(start, end) {
    const startDay = dayjs(start);
    const endDay = dayjs(end);
    const today = dayjs();

    if (today.isBefore(startDay)) {
      return this.getLength(start, end);
    }

    if (today.isAfter(endDay)) {
      return 0;
    }

    return endDay.diff(today, 'day') + 1;
  }
};
