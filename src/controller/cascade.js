const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);
    this.baseurl = path.join(think.ASSETS_PATH, 'cascade');
  }

  /**
   * 根据联动等级获取级联数据
   * @summary level {2 省-地,}
   */
  async indexAction() {
    const { level } = this.get();
    let data = [];
    switch (+level) {
      case 2:
        data = await fs.readJson(path.join(this.baseurl, 'pc-code.json'));
        break;
      case 3:
        data = await fs.readJson(path.join(this.baseurl, 'pca-code.json'));
        break;
      case 4:
        data = await fs.readJson(path.join(this.baseurl, 'pcas-code.json'));
        break;
    }
    return this.success(data);
  }

  /**
   * 根据区域编码获取子级联动数据
   * @summary level: {0: "省级（省份、直辖市、自治区）", 1: "地级（城市）", 2: "县级（区县）", 3: "乡级（乡镇、街道）"}
   * @summary code: 父节点code
   */
  async citysAction() {
    const code = this.get('code') || '';
    let data = [];
    switch (code.length) {
      case 0:
        data = await fs.readJson(path.join(this.baseurl, 'provinces.json'));
        break;
      case 2:
        const cities = await fs.readJson(path.join(this.baseurl, 'cities.json'));
        data = cities.filter(item => item.provinceCode === code);
        break;
      case 4:
        const areas = await fs.readJson(path.join(this.baseurl, 'areas.json'));
        data = areas.filter(item => item.cityCode === code);
        break;
      case 6:
        const streets = await fs.readJson(path.join(this.baseurl, 'streets.json'));
        data = streets.filter(item => item.areaCode === code);
        break;
    }
    return this.success(data);
  }

  /**
   * 根据关键词搜索区域的级联数据
   */
  async searchAction() {
    const { keyword } = this.get();
    let data = [];
    const relationship = await fs.readJson(path.join(this.baseurl, 'pcas-code.json'));
    data = this.dealDeep(relationship, node => node.name.includes(keyword));
    return this.success(data);
  }

  /**
  * 递归过滤节点，但保留原树结构，即符合条件节点的父路径上所有节点不管是否符合条件都保留
  * @param {Node[]} nodes 要过滤的节点
  * @param {node => boolean} predicate 过滤条件，符合条件的节点保留
  * @return 过滤后的根节点数组
  * @see https://segmentfault.com/q/1010000018197249/a-1020000018203261
  */
  dealDeep(nodes, predicate) {
    // 如果已经没有节点了，结束递归
    if (!(nodes && nodes.length)) {
      return;
    }

    const newChildren = [];
    for (const node of nodes) {
      const subs = this.dealDeep(node.children, predicate);

      // 以下两个条件任何一个成立，当前节点都应该加入到新子节点集中
      // 1. 子孙节点中存在符合条件的，即 subs 数组中有值
      // 2. 自己本身符合条件
      if ((subs && subs.length) || predicate(node)) {
        node.children = subs;
        newChildren.push(node);
      }
    }
    return newChildren.length ? newChildren : void 0;
  }
};
