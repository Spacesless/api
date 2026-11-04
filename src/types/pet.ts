/** 宠物展示栏目，沿用来源网站分组，不代表动物学分类。 */
export enum PetCategory {
  /** 宠物狗。 */
  Dog = 'dog',
  /** 宠物猫。 */
  Cat = 'cat',
  /** 宠物龟。 */
  Turtle = 'turtle',
  /** 宠物兔。 */
  Rabbit = 'rabbit',
  /** 观赏鱼及水族。 */
  Fish = 'fish',
  /** 观赏鸟。 */
  Bird = 'bird',
  /** 宠物鼠及来源同栏小型哺乳动物。 */
  Rodent = 'rodent',
  /** 宠物猪。 */
  Pig = 'pig',
  /** 爬宠。 */
  Reptile = 'reptile'
}

/** 来源网站主观评分，统一0至5分，允许半分；缺失或明确不适用时为null。分数越高表示该特征越明显，不代表越好。 */
export interface PetRatings {
  /** 黏人程度。 */
  affection: number | null;
  /** 掉毛或落羽程度；鱼、龟及爬宠不适用，为null。 */
  shedding: number | null;
  /** 鸣叫程度，合并来源的爱叫和喜叫；观赏鱼及水族不适用，为null。 */
  barking: number | null;
  /** 体味程度。 */
  odor: number | null;
  /** 美容护理需求。 */
  grooming: number | null;
  /** 可训练程度，合并来源的训练和可训程度。 */
  trainability: number | null;
  /** 口水程度。 */
  drooling: number | null;
  /** 城市适应程度。 */
  cityAdaptability: number | null;
  /** 友善程度。 */
  friendliness: number | null;
  /** 耐寒程度。 */
  coldTolerance: number | null;
  /** 耐热程度。 */
  heatTolerance: number | null;
  /** 运动需求。 */
  exercise: number | null;
  /** 外观评分。 */
  appearance: number | null;
  /** 干净程度。 */
  cleanliness: number | null;
  /** 智商评分，与智商排名分开。 */
  intelligence: number | null;
  /** 饲养容易程度。 */
  easeOfCare: number | null;
  /** 综合评分。 */
  overall: number | null;
}

export interface Pet {
  /** 展示名称，同一分类内唯一。 */
  name: string;
  /** 原资料全名，无则为null。 */
  fullName: string | null;
  /** 去重后的别名，不包含展示名称。 */
  aliases: string[];
  /** 宠物栏目分类。 */
  category: PetCategory;
  /** 原资料简介，无则为null。 */
  description: string | null;
  /** 原产地。 */
  origin: string | null;
  /** 功能，如伴侣犬、狩猎犬。 */
  purpose: string | null;
  /** 原始体型描述，如小型犬、中型猫。 */
  size: string | null;
  /** 毛发描述，如短毛、长毛。 */
  coat: string | null;
  /** 原始身高描述，保留范围和原文单位，缺少单位时不推断。 */
  height: string | null;
  /** 原始体重描述。 */
  weight: string | null;
  /** 原始寿命范围。 */
  lifespan: string | null;
  /** 原始饲养难度描述。 */
  careDifficulty: string | null;
  /** 性格和特点描述。 */
  traits: string | null;
  /** 来源资料的智商排名，不是科学测量结果，缺失为null。 */
  intelligenceRank: number | null;
  /** 代表图绝对地址；存储时为/pet-images/UUID.webp，接口按当前请求域名拼接；图片统一400×400，缺失为null。 */
  image: string | null;
  /** 猫狗详情页评分优先，宠物大全同义项目合并补缺；按页面保留分值，仅剔除明确不适用项。 */
  ratings: PetRatings;
}

export interface PetQuery {
  /** 名称、全名或别名精确查询。 */
  name?: string;
  /** 同时搜索名称、全名和别名，按字面包含关系匹配。 */
  keyword?: string;
  /** 宠物分类，小驼峰英文枚举。 */
  category?: PetCategory;
  /** 原始体型精确筛选，如小型犬、中型猫。 */
  size?: string;
  /** 毛发精确筛选，如短毛、长毛。 */
  coat?: string;
  /** 原产地包含筛选。 */
  origin?: string;
  /** 页码，默认1。 */
  page?: number;
  /** 每页条数，默认20，最多50。 */
  pageSize?: number;
}

