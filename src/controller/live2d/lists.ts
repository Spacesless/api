import type { Live2dEntry, Live2dListGroup, Live2dListItem } from '../../types/live2d';
import Base = require('./base');
import path = require('path');
import fs = require('fs-extra');

export = class extends Base {
  // 模型列表 id、数量
  /**
   * @summary Live2d模型列表
   * @description live2d模型列表、材质数量、出处
   * demo：https://www.timelessq.com/tool/live2d
   */
  async indexAction() {
    const JSONpath = path.join(this.basePath, 'models.json');
    const modelJson: Live2dEntry[] = await fs.readJson(JSONpath);

    const modelLists: Live2dListGroup[] = [];
    for (const item of modelJson) {
      const { id, name, children } = item;
      const temp: Live2dListItem[] = [];
      if (!think.isEmpty(children)) {
        for (const child of children!) {
          const { id, name, models, message, from } = child;
          let total;
          if (Array.isArray(models)) {
            total = models.length;
          } else {
            const modelDir = path.join(this.basePath, models);
            const switchPath = path.join(modelDir, 'switch_list.json');
            if (think.isExist(switchPath)) {
              const texturesJson: unknown[] | null = await fs.readJson(switchPath);
              total = texturesJson ? texturesJson.length : 0;
            }
          }
          temp.push({ id, name, message, from, total });
        }
      }
      modelLists.push({ id, name, children: temp });
    }

    return this.success(modelLists);
  }
};
