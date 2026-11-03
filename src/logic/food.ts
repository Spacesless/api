export = class extends think.Logic {
  nutritionAction() {
    this.allowMethods = 'get,options';
    this.rules = {
      name: { string: true, length: { max: 100 } },
      keyword: { string: true, length: { max: 100 } },
      category: { in: ['alcohol', 'seafood', 'grain', 'vegetable', 'tuber', 'bean', 'snackBeverage', 'condiment', 'fruit', 'mushroom', 'algae', 'meat', 'egg', 'tea'] },
      categoryCode: { int: { min: 0 } },
      page: { int: { min: 1 } },
      pageSize: { int: { min: 1, max: 50 } }
    };
  }

  recipeAction() {
    this.allowMethods = 'get,options';
    this.rules = {
      name: { string: true, length: { max: 100 } },
      keyword: { string: true, length: { max: 100 } },
      ingredient: { string: true, length: { max: 100 } },
      category: { in: ['seafood', 'breakfast', 'condiment', 'dessert', 'drink', 'meatDish', 'semiFinished', 'soup', 'staple', 'vegetableDish'] },
      tag: { string: true, length: { max: 30 } },
      taste: { string: true, length: { max: 30 } },
      method: { string: true, length: { max: 30 } },
      difficulty: { int: { min: 1, max: 5 } },
      maxDuration: { int: { min: 1 } },
      page: { int: { min: 1 } },
      pageSize: { int: { min: 1, max: 50 } }
    };
  }
};
