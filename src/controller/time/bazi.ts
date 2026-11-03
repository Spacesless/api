import { Solar, SolarUtil } from 'lunar-javascript';
import type { EightChar } from 'lunar-javascript';
import type { BaziPillar, BaziQuery, BaziResult, FiveElement } from '../../types/bazi';
import Base = require('../base');

const stemElements: Record<string, FiveElement> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水'
};

function pillar(chart: EightChar, name: 'Year' | 'Month' | 'Day' | 'Time'): BaziPillar {
  const gods = chart[`get${name}ShiShenZhi`]();
  return {
    ganZhi: chart[`get${name}`](),
    stem: chart[`get${name}Gan`](),
    branch: chart[`get${name}Zhi`](),
    elements: chart[`get${name}WuXing`](),
    naYin: chart[`get${name}NaYin`](),
    tenGod: chart[`get${name}ShiShenGan`](),
    hiddenStems: chart[`get${name}HideGan`]().map((stem, index) => ({ stem, element: stemElements[stem], tenGod: gods[index] }))
  };
}

export = class extends Base {
  /**
   * @summary 八字基础排盘
   * @description 按公历出生年月日时分（北京时间）排四柱、藏干、十神、纳音及表层五行统计，另返回指定日期的通用宜忌。民俗娱乐参考，不提供旺衰、喜用神或个人运势预测。
   */
  indexAction() {
    const query = this.getApiQuery<BaziQuery>();
    const year = Number(query.year), month = Number(query.month), day = Number(query.day);
    const hour = Number(query.hour), minute = Number(query.minute ?? 0);
    const sect = Number(query.sect ?? 2) as 1 | 2;
    if (day > SolarUtil.getDaysOfMonth(year, month)) return this.fail('出生日期无效');

    // 默认查询日使用 UTC+8，与部署机器的时区无关。
    const date = query.date || new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return this.fail('宜忌日期须为 YYYY-MM-DD');
    const [ay, am, ad] = date.split('-').map(Number);
    if (ay < 1900 || ay > 2099 || am < 1 || am > 12 || ad < 1 || ad > SolarUtil.getDaysOfMonth(ay, am)) {
      return this.fail('宜忌日期无效或超出 1900 至 2099 年');
    }

    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();
    const chart = lunar.getEightChar();
    chart.setSect(sect);
    const pillars = { year: pillar(chart, 'Year'), month: pillar(chart, 'Month'), day: pillar(chart, 'Day'), hour: pillar(chart, 'Time') };
    const counts: Record<FiveElement, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
    for (const row of Object.values(pillars)) {
      for (const element of row.elements) counts[element as FiveElement]++;
    }
    const almanac = Solar.fromYmd(ay, am, ad).getLunar();
    const result: BaziResult = {
      birth: solar.toYmdHms(),
      timeBasis: '北京时间 UTC+08:00 民用钟表时间；不校正真太阳时或历史夏令时',
      rules: { yearBoundary: '立春交节时刻', monthBoundary: '十二节交节时刻', sect, dayBoundary: sect === 1 ? '23:00 换日' : '00:00 换日' },
      eightChars: Object.values(pillars).map(row => row.ganZhi).join(' '),
      pillars,
      dayMaster: { stem: pillars.day.stem, element: stemElements[pillars.day.stem] },
      fiveElements: { counts, missing: (Object.keys(counts) as FiveElement[]).filter(element => counts[element] === 0), basis: '仅统计四柱天干及地支本气共八个字，不含藏干、不加权；缺失不等于需要补充' },
      zodiac: lunar.getYearShengXiao(),
      baziZodiac: lunar.getYearShengXiaoExact(),
      astro: solar.getXingZuo() + '座',
      almanac: { date, yi: almanac.getDayYi(), ji: almanac.getDayJi() },
      notice: '传统民俗内容，仅供娱乐参考；五行计数不代表旺衰，通用宜忌不代表个人运势'
    };
    return this.success(result);
  }
};
