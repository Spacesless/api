const Base = require('./base');
const path = require('path');
const fs = require('fs-extra');

module.exports = class extends Base {
  constructor(...arg) {
    super(...arg);
    this.baseUrl = path.join(think.ASSETS_PATH, 'cascade');
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
        data = await fs.readJson(path.join(this.baseUrl, 'pc-code.json'));
        break;
      case 3:
        data = await fs.readJson(path.join(this.baseUrl, 'pca-code.json'));
        break;
      case 4:
        data = await fs.readJson(path.join(this.baseUrl, 'pcas-code.json'));
        break;
    }
    return this.success(data);
  }

  /**
   * 根据区域编码获取子级联动数据
   * @summary level: {0: "省级（省份、直辖市、自治区）", 1: "地级（城市）", 2: "县级（区县）", 3: "乡级（乡镇、街道）"}
   * @summary code: 父节点code
   */
  async getAreaByCodeAction() {
    const code = this.get('code') || '';
    let data = [];
    switch (code.length) {
      case 0:
        data = await fs.readJson(path.join(this.baseUrl, 'provinces.json'));
        break;
      case 2:
        const cities = await fs.readJson(path.join(this.baseUrl, 'cities.json'));
        data = cities.filter(item => item.provinceCode === code);
        break;
      case 4:
        const areas = await fs.readJson(path.join(this.baseUrl, 'areas.json'));
        data = areas.filter(item => item.cityCode === code);
        break;
      case 6:
        const streets = await fs.readJson(path.join(this.baseUrl, 'streets.json'));
        data = streets.filter(item => item.areaCode === code);
        break;
    }
    return this.success(data);
  }

  /**
   * 根据关键词搜索区域的级联数据
   */
  async searchAction() {
    const { keyword, keepParent } = this.get();
    let data = [];
    const relationship = await fs.readJson(path.join(this.baseUrl, 'pcas-code.json'));
    if (keepParent === 'true' || keepParent === '1') {
      data = this.filterNodesDeep(relationship, node => node.name.indexOf(keyword) === 0);
    } else {
      data = this.filterNodes(relationship, node => node.name.indexOf(keyword) === 0);
    }
    return this.success(data);
  }

  /**
   * 递归过滤节点，生成新的树结构
   * @param {Node[]} nodes 要过滤的节点
   * @param {node => boolean} predicate 过滤条件，符合条件的节点保留
   * @return 过滤后的节点
   * @see https://segmentfault.com/q/1010000018175132/a-1020000018183508
   */
  filterNodes(nodes, predicate) {
    // 如果已经没有节点了，结束递归
    if (!(nodes && nodes.length)) {
      return [];
    }

    const newChildren = [];
    for (const node of nodes) {
      if (predicate(node)) {
        // 如果节点符合条件，直接加入新的节点集
        newChildren.push(node);
        node.children = this.filterNodes(node.children, predicate);
      } else {
        // 如果当前节点不符合条件，递归过滤子节点，
        // 把符合条件的子节点提升上来，并入新节点集
        newChildren.push(...this.filterNodes(node.children, predicate));
      }
    }
    return newChildren;
  }

  /**
  * 递归过滤节点，但保留原树结构，即符合条件节点的父路径上所有节点不管是否符合条件都保留
  * @param {Node[]} nodes 要过滤的节点
  * @param {node => boolean} predicate 过滤条件，符合条件的节点保留
  * @return 过滤后的根节点数组
  * @see https://segmentfault.com/q/1010000018197249/a-1020000018203261
  */
  filterNodesDeep(nodes, predicate) {
    // 如果已经没有节点了，结束递归
    if (!(nodes && nodes.length)) {
      return;
    }

    const newChildren = [];
    for (const node of nodes) {
      const subs = this.filterNodesDeep(node.children, predicate);

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
