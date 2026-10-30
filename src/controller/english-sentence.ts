import type { IcibaResponse, IcibaSentence } from '../types/data';
import type Model = require('../model/english-sentence');
import axios from 'axios';
import dayjs = require('dayjs');
import Base = require('./base');

export = class extends Base {
  declare modelInstance: InstanceType<typeof Model>;
  constructor(...args: ConstructorParameters<typeof Base>) {
    super(...args);
    this.modelInstance = this.mongo('english-sentence');
  }

  async indexAction() {
    const { date } = this.getApiQuery('/english-sentence');

    const targetDate = date || dayjs().format('YYYY-MM-DD');

    const record = await this.modelInstance.findRecord(targetDate);

    if (record) {
      return this.success(record);
    } else {
      this.fail('未找到对应记录');
    }
  }

  async randomAction() {
    const record = await this.modelInstance.randomRecord();

    if (record.length) {
      const firstRecord = record[0];
      return this.success(firstRecord);
    } else {
      this.fail('未找到对应记录');
    }
  }

  async listAction() {
    const { page, pageSize } = this.getApiQuery('/english-sentence/list');

    const list = await this.modelInstance.selectRecord(page, pageSize);

    this.success(list);
  }

  /**
   * 请求每日一句，默认使用原接口，并统一返回字段。
   */
  async fetchSentence(url = 'https://open.iciba.com/dsapi', params?: Record<string, string>): Promise<IcibaSentence | null> {
    try {
      const response = await axios.request<IcibaResponse>({
        url,
        params,
        method: 'get',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0'
        }
      });
      const result = response.data;
      if (!result || (result.errno !== undefined && result.errno !== 0)) {
        throw new Error('接口未返回有效数据');
      }

      // 备用接口使用 title 作为日期，统一为现有入库接口的字段。
      const normalized = {
        ...result,
        sid: result.sid == null ? '' : String(result.sid),
        dateline: result.dateline || result.title,
        fenxiang_img: result.fenxiang_img || null,
        picture4: result.picture4 || null
      };
      if (!normalized.sid ||
        typeof normalized.content !== 'string' || !normalized.content.trim() ||
        typeof normalized.note !== 'string' || !normalized.note.trim() ||
        typeof normalized.dateline !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(normalized.dateline)) {
        throw new Error('接口返回数据缺少必要字段');
      }
      return normalized as IcibaSentence;
    } catch (error) {
      think.logger.warn(`每日英语采集失败 (${url}): ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }

  }

  /**
   * 从备用接口获取指定日期的每日一句。
   */
  async fetchFallbackSentence(date = dayjs().format('YYYY-MM-DD')) {
    return this.fetchSentence('https://sentence.iciba.com/index.php', {
      c: 'dailysentence',
      m: 'getdetail',
      title: date
    });
  }

  /**
   * 定时采集任务
   */
  async crontabAction() {
    const data = await this.fetchSentence() || await this.fetchFallbackSentence();

    if (data) {
      const insertId = await this.modelInstance.addRecord(data);
      think.logger.debug(JSON.stringify(data));
      if (insertId) {
        return this.success();
      } else {
        return this.fail();
      }
    }
    return this.fail();
  }
};
