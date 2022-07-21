const Base = require('../base');
const path = require('path');
const fs = require('fs-extra');

const nationalityMap = {
  'Eagle Union': '白鹰',
  'Royal Navy': '皇家',
  'Sakura Empire': '重樱',
  'Iron Blood': '铁血',
  'Dragon Empery': '东煌',
  'Sardegna Empire': '撒丁帝国',
  'Northern Parliament': '北方联合',
  'Iris Libre': '自由鸢尾',
  'Vichya Dominion': '维希教廷',
  'Bilibili': 'Bilibili,其他',
  'Kizuna AI': '绊爱,其他',
  'Neptunia': '海皇星,其他',
  'Utawarerumono': '传颂之物,其他',
  'META': 'META,其他',
  'Hololive': 'Hololive,其他',
  'Venus Vacation': '死或生：沙滩排球维纳斯假期,其他',
  'Universal': '其他'
};

const hullTypeMap = {
  'Destroyer': '驱逐',
  'Monitor': '重炮,其他',
  'Light Cruiser': '轻巡',
  'Heavy Cruiser': '重巡',
  'Large Cruiser': '超巡, 重巡',
  'Aircraft Carrier': '航母',
  'Light Carrier': '轻航, 航母',
  'Battleship': '战列',
  'Battlecruiser': '战巡, 战列',
  'Repair': '维修',
  'Submarine': '潜艇',
  'Submarine Carrier': '潜母',
  'Munition Ship': '运输,其他'
};

const rarityMap = {
  'Normal': '普通',
  'Rare': '稀有',
  'Elite': '精锐',
  'Super Rare': '超稀有',
  'Priority': '超稀有',
  'Decisive': '海上传奇',
  'Ultra Rare': '海上传奇'
};

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);
    this.basePath = path.join(think.ASSETS_PATH, 'azurlane-assets');
  }

  async __before() {
    super.__before();
    const jsonPath = path.join(this.basePath, 'ships.json');
    const isExist = think.isExist(jsonPath);
    this.ships = isExist ? await fs.readJson(jsonPath) : [];
  }

  async listsAction() {
    const {
      name,
      nationality: nationalityParam,
      hullType: hullTypeParam,
      rarity: rarityParam
    } = this.get();
    const formatName = name ? name.trim() : '';

    const targetShips = [];
    this.ships.forEach(item => {
      const {
        id,
        hullType,
        names,
        nationality,
        rarity,
        thumbnail,
        class: classify
      } = item;
      const result = {
        id,
        classify,
        names,
        thumbnail,
        hullType: hullTypeMap[hullType] || hullType || '',
        nationality: nationalityMap[nationality] || nationality || '',
        rarity: rarityMap[rarity] || rarity || ''
      };
      const inNames = JSON.stringify(names).includes(formatName);
      const inNationality = nationalityParam ? result.nationality.includes(nationalityParam) : true;
      const inHullType = hullTypeParam ? result.hullType.includes(hullTypeParam) : true;
      const inRarity = rarityParam ? result.rarity.includes(rarityParam) : true;
      if (inNames && inNationality && inHullType && inRarity) {
        targetShips.push(result);
      }
    });

    return this.success(targetShips);
  }

  indexAction() {
    const {
      id
    } = this.get();

    const findShip = this.ships.find(item => item.id === id) || {};
    const { hullType, nationality, rarity } = findShip;
    const result = {
      ...findShip,
      hullType: hullTypeMap[hullType] || hullType,
      nationality: nationalityMap[nationality] || nationality,
      rarity: rarityMap[rarity] || rarity
    };

    return this.success(result);
  }
};
