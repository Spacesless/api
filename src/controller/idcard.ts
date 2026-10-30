import type { IdCardQuery } from '../types/idcard';
import Base = require('./base');
import path = require('path');
import fs = require('fs-extra');

const basePath = path.join(think.ASSETS_PATH, 'idcard.json');

export = class extends Base {
  /**
   * @summary 身份证归属地查询
   * @description 身份证前6位数字查询归属地。
   */
  async indexAction() {
    const readJsonContent: Record<string, string> = await fs.readJson(basePath);
    const { id } = this.getApiQuery<IdCardQuery>();

    const findId = readJsonContent[id];
    if (findId) {
      return this.success(findId);
    } else {
      return this.fail('未找到相关记录');
    }
  }
};
