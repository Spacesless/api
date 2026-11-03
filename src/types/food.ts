/** 食物分类，仅对原始数据明确提供的中文分类编码，不猜测 SQL 分类码含义。 */
export enum FoodCategory {
  /** 酒类。 */
  Alcohol = 'alcohol',
  /** 河海鲜。 */
  Seafood = 'seafood',
  /** 谷类。 */
  Grain = 'grain',
  /** 蔬菜。 */
  Vegetable = 'vegetable',
  /** 薯类。 */
  Tuber = 'tuber',
  /** 豆类。 */
  Bean = 'bean',
  /** 零食饮料。 */
  SnackBeverage = 'snackBeverage',
  /** 调味品类。 */
  Condiment = 'condiment',
  /** 水果。 */
  Fruit = 'fruit',
  /** 菌类。 */
  Mushroom = 'mushroom',
  /** 藻类。 */
  Algae = 'algae',
  /** 畜肉。 */
  Meat = 'meat',
  /** 蛋类。 */
  Egg = 'egg',
  /** 茶类。 */
  Tea = 'tea'
}

/** SQL 风格的平铺数值字段，按每100克可食部统计，缺失值为 null。单位后缀 G=克、Mg=毫克、Ug=微克、Kcal=千卡、Percent=百分比。 */
export interface FoodNutrition {
  /** MongoDB 自动生成，导入文件不包含此字段。 */
  _id: string;
  /** 食物原始名称，保留生熟、品种和加工状态。 */
  name: string;
  /** 原始数据提供的别名，去重并剔除“无”，不从名称臆造。 */
  aliases: string[];
  /** 已知分类编码；SQL缺少分类字典时为null。 */
  category: FoodCategory | null;
  /** 原始中文分类名称，缺失为null。 */
  categoryName: string | null;
  /** SQL原始食物编码xuhao，缺失为null。 */
  foodCode: string | null;
  /** SQL原始leixing编码，缺失为null。 */
  typeCode: number | null;
  /** SQL原始leibie编码，未推断含义，缺失为null。 */
  categoryCode: number | null;
  /** SQL原始lei编码，未推断含义，缺失为null。 */
  groupCode: number | null;
  /** 营养数据对应的可食部质量，固定100克，由数据提供方确认。 */
  basisGrams: number;
  /** 食部百分比，0至100，缺失或原值越界时为null；不据此再折算营养值。 */
  ediblePortionPercent: number | null;
  /** 能量，单位：千卡，缺失为null。 */
  energyKcal: number | null;
  /** 原表计算能量，单位：千卡，缺失为null。 */
  calculatedEnergyKcal: number | null;
  /** 水分，单位：克，缺失为null。 */
  waterG: number | null;
  /** 蛋白质，单位：克，缺失为null。 */
  proteinG: number | null;
  /** 脂肪，单位：克，缺失为null。 */
  fatG: number | null;
  /** 碳水化合物，单位：克，缺失为null。 */
  carbohydrateG: number | null;
  /** 原表膳食/粗纤维，单位：克，缺失为null；来源间检测口径未统一。 */
  fiberG: number | null;
  /** 灰分，单位：克，缺失为null。 */
  ashG: number | null;
  /** 单不饱和脂肪酸，单位：克，缺失为null。 */
  monounsaturatedFatG: number | null;
  /** 多不饱和脂肪酸，单位：克，缺失为null。 */
  polyunsaturatedFatG: number | null;
  /** 多不饱和脂肪酸占总脂肪酸比例，单位：%，缺失为null。 */
  polyunsaturatedFatPercent: number | null;
  /** 反式脂肪酸，单位：克，缺失为null。 */
  transFatG: number | null;
  /** 反式脂肪酸占总脂肪酸比例，单位：%，缺失为null。 */
  transFatPercent: number | null;
  /** 胆固醇，单位：毫克，缺失为null。 */
  cholesterolMg: number | null;
  /** 植物固醇，单位：毫克，缺失为null。 */
  plantSterolsMg: number | null;
  /** 胡萝卜素，单位：微克，缺失为null。 */
  caroteneUg: number | null;
  /** 视黄醇，单位：微克，缺失为null。 */
  retinolUg: number | null;
  /** 叶黄素类，单位：微克，缺失为null。 */
  luteinUg: number | null;
  /** 番茄红素，单位：微克，缺失为null。 */
  lycopeneUg: number | null;
  /** 钙，单位：毫克，缺失为null。 */
  calciumMg: number | null;
  /** 镁，单位：毫克，缺失为null。 */
  magnesiumMg: number | null;
  /** 钠，单位：毫克，缺失为null。 */
  sodiumMg: number | null;
  /** 钾，单位：毫克，缺失为null。 */
  potassiumMg: number | null;
  /** 磷，单位：毫克，缺失为null。 */
  phosphorusMg: number | null;
  /** 硫，单位：毫克，缺失为null。 */
  sulfurMg: number | null;
  /** 氯，单位：毫克，缺失为null。 */
  chlorineMg: number | null;
  /** 铁，单位：毫克，缺失为null。 */
  ironMg: number | null;
  /** 碘，单位：微克，缺失为null。 */
  iodineUg: number | null;
  /** 锌，单位：毫克，缺失为null。 */
  zincMg: number | null;
  /** 硒，单位：微克，缺失为null。 */
  seleniumUg: number | null;
  /** 铜，单位：毫克，缺失为null。 */
  copperMg: number | null;
  /** 锰，单位：毫克，缺失为null。 */
  manganeseMg: number | null;
  /** 氟，单位：微克，缺失为null。 */
  fluorineUg: number | null;
  /** 维生素A，单位：微克，缺失为null。 */
  vitaminAUg: number | null;
  /** 维生素C，单位：毫克，缺失为null。 */
  vitaminCMg: number | null;
  /** 维生素D，单位：微克，缺失为null。 */
  vitaminDUg: number | null;
  /** 维生素E，单位：毫克，缺失为null。 */
  vitaminEMg: number | null;
  /** 维生素K，单位：微克，缺失为null。 */
  vitaminKUg: number | null;
  /** 类黄酮，单位：毫克，缺失为null。 */
  flavonoidsMg: number | null;
  /** 维生素B1（硫胺素），单位：毫克，缺失为null。 */
  vitaminB1Mg: number | null;
  /** 维生素B2（核黄素），单位：毫克，缺失为null。 */
  vitaminB2Mg: number | null;
  /** 维生素B3（烟酸），单位：毫克，缺失为null。 */
  vitaminB3Mg: number | null;
  /** 胆碱，单位：毫克，缺失为null。 */
  cholineMg: number | null;
  /** 维生素B5（泛酸），单位：毫克，缺失为null。 */
  vitaminB5Mg: number | null;
  /** 维生素B6，单位：毫克，缺失为null。 */
  vitaminB6Mg: number | null;
  /** 生物素，单位：微克，缺失为null。 */
  biotinUg: number | null;
  /** 叶酸，单位：微克，缺失为null。 */
  folateUg: number | null;
  /** 维生素B12，单位：微克，缺失为null。 */
  vitaminB12Ug: number | null;
  /** 甜菜碱，单位：毫克，缺失为null。 */
  betaineMg: number | null;
  /** 亮氨酸，单位：毫克，缺失为null。 */
  leucineMg: number | null;
  /** 蛋氨酸，单位：毫克，缺失为null。 */
  methionineMg: number | null;
  /** 苏氨酸，单位：毫克，缺失为null。 */
  threonineMg: number | null;
  /** 赖氨酸，单位：毫克，缺失为null。 */
  lysineMg: number | null;
  /** 色氨酸，单位：毫克，缺失为null。 */
  tryptophanMg: number | null;
  /** 缬氨酸，单位：毫克，缺失为null。 */
  valineMg: number | null;
  /** 组氨酸，单位：毫克，缺失为null。 */
  histidineMg: number | null;
  /** 异亮氨酸，单位：毫克，缺失为null。 */
  isoleucineMg: number | null;
  /** 苯丙氨酸，单位：毫克，缺失为null。 */
  phenylalanineMg: number | null;
}

export interface FoodNutritionQuery {
  /** 食物名称或别名精确查询；同名数据合并，生熟和品种不同的完整名称分别保留。 */
  name?: string;
  /** 同时搜索食物名称和别名，按字面包含关系匹配。 */
  keyword?: string;
  /** 已知分类编码，小驼峰英文；不包含分类未知的记录。 */
  category?: FoodCategory;
  /** SQL 原始分类码leibie。 */
  categoryCode?: number;
  /** 页码，默认1。 */
  page?: number;
  /** 每页条数，默认10，最多50。 */
  pageSize?: number;
}

/** 菜谱分类，来自原始目录或结合菜名、食材和做法补充；无法确认时为 null。 */
export enum RecipeCategory {
  /** 水产。 */
  Seafood = 'seafood',
  /** 早餐。 */
  Breakfast = 'breakfast',
  /** 调味料。 */
  Condiment = 'condiment',
  /** 甜点。 */
  Dessert = 'dessert',
  /** 饮品。 */
  Drink = 'drink',
  /** 荤菜。 */
  MeatDish = 'meatDish',
  /** 半成品。 */
  SemiFinished = 'semiFinished',
  /** 汤。 */
  Soup = 'soup',
  /** 主食。 */
  Staple = 'staple',
  /** 素菜。 */
  VegetableDish = 'vegetableDish'
}

export interface RecipeIngredient {
  /** 食材名称。 */
  name: string;
  /** 原始用量或配比表达式，如400克、适量、1个*份数；未注明为空字符串。 */
  amount: string;
  /** 原始分组，如主料、辅料、调料、鱼香调料；未分组为null。 */
  group: string | null;
}

export interface RecipeStep {
  /** 制作顺序，从1开始连续编号。 */
  order: number;
  /** 步骤说明，保留附属操作和注意事项的换行。 */
  text: string;
}

export interface Recipe {
  /** MongoDB自动生成，导入文件不含此字段；同名的不同做法分别保留。 */
  _id: string;
  /** 菜名。 */
  name: string;
  /** 原始菜品简介，无则为null。 */
  description: string | null;
  /** 原始或根据菜名、食材和做法补充的分类，无法确认时为null。 */
  category: RecipeCategory | null;
  /** 已知标签，如春季、夏季，无则为空数组。 */
  tags: string[];
  /** 食材及原始用量，不将烹饪工具当作食材。 */
  ingredients: RecipeIngredient[];
  /** 制作步骤。 */
  steps: RecipeStep[];
  /** 主要口味，如咸鲜、酸甜；结合描述及调味食材补充，无法确认时为null。 */
  taste: string | null;
  /** 主要成菜工艺，如炒、炖、蒸；结合菜名及步骤补充，无法确认时为null。 */
  method: string | null;
  /** 原文明确可换算的预计总耗时，单位分钟；数小时、范围或多个方案无法明确时为null。 */
  duration: number | null;
  /** 难度1至5星。原星级直接保留；简单=1、普通=2、高级=4，未知为null。 */
  difficulty: number | null;
  /** 原始份量及用量计算说明，无则为null，不猜测固定人数。 */
  servings: string | null;
  /** 烹饪提示、工具或计量补充说明，过滤推广及仓库协作模板。 */
  tips: string[];
}

export interface RecipeQuery {
  /** 菜名包含查询，特殊符号按字面匹配。 */
  name?: string;
  /** 同时搜索菜名和食材名称，按字面包含关系匹配。 */
  keyword?: string;
  /** 食材名称包含查询，如鸡蛋。 */
  ingredient?: string;
  /** 分类，小驼峰英文枚举。 */
  category?: RecipeCategory;
  /** 标签精确筛选，如春季。 */
  tag?: string;
  /** 口味精确筛选。 */
  taste?: string;
  /** 工艺精确筛选。 */
  method?: string;
  /** 难度星级，1至5；不包含难度未知的记录。 */
  difficulty?: number;
  /** 最长耗时，单位分钟；不包含耗时未知的记录。 */
  maxDuration?: number;
  /** 页码，默认1。 */
  page?: number;
  /** 每页条数，默认10，最多50。 */
  pageSize?: number;
}
