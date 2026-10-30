import type { Live2dEntry } from '../../types/data';
import Base = require('./base');
import path = require('path');
import fs = require('fs-extra');

export = class extends Base {
  // 模型列表 id、数量
  async indexAction() {
    const JSONpath = path.join(this.basePath, 'models.json');
    const modelJson: Live2dEntry[] = await fs.readJson(JSONpath);

    const modelLists = [];
    for (const item of modelJson) {
      const { id, name, children } = item;
      const temp = [];
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
              const texturesJson = await fs.readJson(switchPath);
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
