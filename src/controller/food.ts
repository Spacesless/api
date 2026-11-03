import type { FoodNutrition, FoodNutritionQuery, Recipe, RecipeQuery } from '../types/food';
import type { MongoFilter } from '../types/common';
import Base = require('./base');

function contains(value: string) {
  return { $regex: value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') };
}

export = class extends Base {
  /**
   * @summary 食物营养查询
   * @description 按名称或别名、关键词和分类组合查询每100克可食部的营养成分，统一返回分页结果。其他数据补缺；null表示数据缺失，0保留原值。生熟、品种和加工状态不同的名称分别保留。
   */
  async nutritionAction() {
    const { name, keyword, category, categoryCode, page = 1, pageSize = 10 } = this.getApiQuery<FoodNutritionQuery>();
    const where: MongoFilter = {};
    if (category) where.category = category;
    if (categoryCode !== undefined) where.categoryCode = Number(categoryCode);
    const conditions: MongoFilter[] = [];
    if (name) conditions.push({ $or: [{ name }, { aliases: name }] });
    if (keyword) conditions.push({ $or: [{ name: contains(keyword) }, { aliases: contains(keyword) }] });
    if (conditions.length) where.$and = conditions;
    const list = await this.mongo<FoodNutrition>('food-nutrition')
      .where(where).order('_id ASC').page(page, pageSize).countSelect();
    return this.success(list);
  }

  /**
   * @summary 菜谱查询
   * @description 按菜名、食材、分类、标签、口味、工艺、难度及最长耗时组合筛选，统一返回分页结果。同名不同做法分别保留；duration为分钟，difficulty为1至5星，未知值为null。
   */
  async recipeAction() {
    const { name, keyword, ingredient, category, tag, taste, method, difficulty, maxDuration, page = 1, pageSize = 10 } = this.getApiQuery<RecipeQuery>();
    const where: MongoFilter = {};
    if (name) where.name = contains(name);
    if (ingredient) where['ingredients.name'] = contains(ingredient);
    if (category) where.category = category;
    if (tag) where.tags = tag;
    if (taste) where.taste = taste;
    if (method) where.method = method;
    if (difficulty !== undefined) where.difficulty = Number(difficulty);
    if (maxDuration !== undefined) where.duration = { $gt: 0, $lte: Number(maxDuration) };
    if (keyword) where.$or = [{ name: contains(keyword) }, { 'ingredients.name': contains(keyword) }];
    const list = await this.mongo<Recipe>('food-recipe')
      .where(where).field({ images: 0, 'steps.images': 0 }).order('_id ASC').page(page, pageSize).countSelect();
    return this.success(list);
  }

};
