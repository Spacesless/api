/** 碧蓝航线舰船资源数据，来自 AzurAPI，描述类文本多为英文。 */
export interface Ship {
    /** 舰船资源 ID。 */
    id: string;
    /** 舰船分组 ID，用于关联皮肤配置。 */
    _gid: number;
    /** 舰船各突破阶段的数据 ID。 */
    _sid: number[];
    /** 舰船内部编号。 */
    _code: number;
    /** Wiki 页面地址。 */
    wikiUrl: string;
    /** 各语言的舰船名称。 */
    names: ShipNames;
    /** 各服务器是否已实装。 */
    exists: ShipExists;
    /** 六维能力评级。 */
    hexagon: number[];
    /** 舰级，如：Benson。 */
    class: string;
    /** 阵营，上游为英文，接口返回时转换为中文。 */
    nationality: string;
    /** 舰种，上游为英文，接口返回时转换为中文。 */
    hullType: string;
    /** 稀有度，上游为英文，接口返回时转换为中文。 */
    rarity: string;
    /** 舰船缩略图地址。 */
    thumbnail: string;
    /** 初始星级。 */
    stars: number;
    /** 各等级的属性。 */
    stats: ShipStatsGroups;
    /** 装备栏位。 */
    slots: ShipSlot[];
    /** 作为强化素材时提供的强化值。 */
    enhanceValue: ShipEnhanceValue;
    /** 退役获得的资源。 */
    scrapValue: ShipScrapValue;
    /** 技能列表。 */
    skills: ShipSkill[];
    /** 各次突破获得的加成，每次突破一组。 */
    limitBreaks?: string[][] | null;
    /** 科技点与舰队科技加成。 */
    fleetTech: ShipFleetTech;
    /** 建造信息。 */
    construction: ShipConstruction;
    /** 获取途径。 */
    obtainedFrom: ShipObtainedFrom;
    /** 画师和声优。 */
    misc: ShipMisc;
    /** 皮肤列表。 */
    skins: ShipSkinData[];
    /** 画廊图片。 */
    gallery: ShipGalleryItem[];
    /** 是否可改造。 */
    retrofit?: boolean;
    /** 改造后的舰船 ID。 */
    retrofitId?: string;
    /** 改造后的舰种。 */
    retrofitHullType?: string;
    /** 改造项目，键为项目编号（A、B、C...）。 */
    retrofitProjects?: ShipRetrofitProjects;
    /** 科研舰的开发等级加成。 */
    devLevels?: ShipDevLevel[];
}
/** 各语言的舰船名称。 */
export interface ShipNames {
    /** 中文名。 */
    cn: string;
    /** 英文名。 */
    en: string;
    /** 日文名。 */
    jp: string;
    /** 韩文名。 */
    kr: string;
    /** 繁体中文名。 */
    tw?: string;
    /** 带舰船前缀的英文名，如：USS Laffey。 */
    code: string;
}
/** 各服务器是否已实装。 */
export interface ShipExists {
    /** 国际服。 */
    en: boolean;
    /** 国服。 */
    cn: boolean;
    /** 日服。 */
    jp: boolean;
    /** 韩服。 */
    kr: boolean;
}
/** 各等级的舰船属性，改造属性仅可改造舰船返回。 */
export interface ShipStatsGroups {
    /** 1 级基础属性。 */
    baseStats: ShipStats;
    /** 100 级属性。 */
    level100: ShipStats;
    /** 120 级属性。 */
    level120: ShipStats;
    /** 125 级属性。 */
    level125: ShipStats;
    /** 改造后 100 级属性。 */
    level100Retrofit?: ShipStats;
    /** 改造后 120 级属性。 */
    level120Retrofit?: ShipStats;
    /** 改造后 125 级属性。 */
    level125Retrofit?: ShipStats;
}
/** 舰船属性，数值均为字符串。 */
export interface ShipStats {
    /** 耐久。 */
    health: string;
    /** 装甲类型，如：Light。 */
    armor: string;
    /** 装填。 */
    reload: string;
    /** 幸运。 */
    luck: string;
    /** 炮击。 */
    firepower: string;
    /** 雷击。 */
    torpedo: string;
    /** 机动。 */
    evasion: string;
    /** 航速。 */
    speed: string;
    /** 防空。 */
    antiair: string;
    /** 航空。 */
    aviation: string;
    /** 油耗。 */
    oilConsumption: string;
    /** 命中。 */
    accuracy: string;
    /** 反潜。 */
    antisubmarineWarfare: string;
    /** 氧气，仅潜艇。 */
    oxygen?: string;
    /** 弹药量，仅潜艇。 */
    ammunition?: string;
    /** 狩猎范围示意图，仅潜艇。 */
    huntingRange?: string;
}
/** 装备栏位。 */
export interface ShipSlot {
    /** 可装备类型，如：DD Guns。 */
    type: string;
    /** 初始装备效率（%）。 */
    minEfficiency: number;
    /** 满突破装备效率（%）。 */
    maxEfficiency: number;
    /** 改造后装备效率（%）。 */
    kaiEfficiency?: number;
    /** 装备数量上限。 */
    max: number;
}
/** 作为强化素材时提供的强化值。 */
export interface ShipEnhanceValue {
    /** 炮击。 */
    firepower?: number;
    /** 雷击。 */
    torpedo?: number;
    /** 航空。 */
    aviation?: number;
    /** 装填。 */
    reload?: number;
}
/** 退役获得的资源。 */
export interface ShipScrapValue {
    /** 物资。 */
    coin?: number;
    /** 勋章。 */
    medal?: number;
    /** 心智单元。 */
    core?: number;
}
/** 舰船技能。 */
export interface ShipSkill {
    /** 技能图标地址。 */
    icon: string;
    /** 各语言的技能名称。 */
    names: ShipSkillNames;
    /** 技能描述（英文）。 */
    description: string;
    /** 技能类型颜色，如：gold、red、blue。 */
    color: string;
}
/** 各语言的技能名称。 */
export interface ShipSkillNames {
    /** 英文名。 */
    en: string;
    /** 中文名，缺失时为 null。 */
    cn: string | null;
    /** 日文名，缺失时为 null。 */
    jp: string | null;
}
/** 科技点与舰队科技加成。 */
export interface ShipFleetTech {
    /** 舰队科技属性加成。 */
    statsBonus: ShipFleetTechStatsBonus;
    /** 可获得的科技点。 */
    techPoints: ShipFleetTechPoints;
}
/** 舰队科技属性加成。 */
export interface ShipFleetTechStatsBonus {
    /** 获得舰船时的加成，没有时为 null。 */
    collection: ShipFleetTechBonus | null;
    /** 舰船满级时的加成，没有时为 null。 */
    maxLevel: ShipFleetTechBonus | null;
}
/** 舰队科技单项加成。 */
export interface ShipFleetTechBonus {
    /** 适用舰种。 */
    applicable: string[];
    /** 加成值，如：+1。 */
    bonus: string;
    /** 加成属性，如：health。 */
    stat: string;
}
/** 可获得的科技点。 */
export interface ShipFleetTechPoints {
    /** 获得舰船时的科技点，没有时为 null。 */
    collection: number | null;
    /** 满突破时的科技点。 */
    maxLimitBreak: number;
    /** 满级时的科技点。 */
    maxLevel: number;
    /** 科技点合计。 */
    total: number;
}
/** 建造信息。 */
export interface ShipConstruction {
    /** 建造时间，不可建造时为说明文字，如：Cannot Be Constructed。 */
    constructionTime: string;
    /** 各建造池是否可获得。 */
    availableIn: ShipConstructionPools;
}
/** 各建造池是否可获得；有限制条件时为说明文字。 */
export interface ShipConstructionPools {
    /** 轻型舰建造。 */
    light: boolean | string;
    /** 重型舰建造。 */
    heavy: boolean | string;
    /** 特型舰建造。 */
    aviation: boolean | string;
    /** 限时建造。 */
    limited: boolean | string;
    /** 商店兑换。 */
    exchange: boolean | string;
}
/** 获取途径。 */
export interface ShipObtainedFrom {
    /** 其他获取方式说明。 */
    obtainedFrom?: string;
    /** 可掉落的地图，如：8-1；有附加条件时为对象。 */
    fromMaps: (string | ShipMapDrop)[];
}
/** 带条件的地图掉落。 */
export interface ShipMapDrop {
    /** 地图编号。 */
    name: string;
    /** 掉落条件说明。 */
    note: string;
}
/** 画师和声优。 */
export interface ShipMisc {
    /** 画师。 */
    artist: ShipArtist;
    /** 声优。 */
    voice: ShipVoiceActor;
}
/** 画师。 */
export interface ShipArtist {
    /** 画师名称。 */
    name: string;
    /** 画师主页，键为站点名，如：Wiki、Pixiv、Twitter、Link。 */
    urls: { [site: string]: string };
}
/** 声优。 */
export interface ShipVoiceActor {
    /** 声优名称。 */
    name: string;
    /** 声优主页。 */
    url?: string;
}
/** 舰船皮肤。 */
export interface ShipSkinData {
    /** 皮肤名称，如：Default。 */
    name: string;
    /** 立绘地址。 */
    image: string;
    /** 带背景的立绘地址。 */
    bg?: string;
    /** 国服版本立绘地址。 */
    cn?: string;
    /** 背景图地址。 */
    background: string;
    /** Q 版小人地址。 */
    chibi: string;
    /** 皮肤详情。 */
    info: ShipSkinInfo;
}
/** 皮肤详情。 */
export interface ShipSkinInfo {
    /** 是否为 Live2D 皮肤。 */
    live2dModel: boolean;
    /** 获取方式。 */
    obtainedFrom: string;
    /** 皮肤分类。 */
    category?: string;
    /** 皮肤图标。 */
    icons?: ShipSkinIcon[];
    /** 国际服皮肤名。 */
    enClient?: string;
    /** 国际服上架情况。 */
    enLimited?: string;
    /** 国服皮肤名。 */
    cnClient?: string;
    /** 国服上架情况。 */
    cnLimited?: string;
    /** 日服皮肤名。 */
    jpClient?: string;
    /** 日服上架情况。 */
    jpLimited?: string;
    /** 价格（钻石）。 */
    cost?: number;
    /** 首次登场的活动。 */
    firstIntroduced?: string;
    /** 共用此皮肤的舰船。 */
    sharedWith?: string;
    /** 皮肤专属音乐。 */
    music?: string;
}
/** 皮肤图标。 */
export interface ShipSkinIcon {
    /** 图标地址。 */
    url: string;
    /** 图标类型，如：icon。 */
    urlType: string;
}
/** 画廊图片。 */
export interface ShipGalleryItem {
    /** 图片说明。 */
    description: string;
    /** 图片地址。 */
    url: string;
}
/** 改造项目，键为项目编号（A、B、C...）。 */
export interface ShipRetrofitProjects {
    [project: string]: ShipRetrofitProject;
}
/** 改造项目。 */
export interface ShipRetrofitProject {
    /** 项目名称，如：Hull Improvement Ⅰ。 */
    id: string;
    /** 项目等级，如：I、II。 */
    grade?: string;
    /** 属性提升。 */
    attributes: string[];
    /** 所需材料。 */
    materials: string[];
    /** 所需物资。 */
    coins: number;
    /** 所需舰船等级。 */
    level: number;
    /** 所需突破次数。 */
    levelBreakLevel: number;
    /** 所需突破星级，如：★★☆☆。 */
    levelBreakStars: string;
    /** 可重复次数。 */
    recurrence: number | null;
    /** 前置项目编号。 */
    require: string[];
}
/** 科研舰开发等级加成。 */
export interface ShipDevLevel {
    /** 开发等级。 */
    level: string;
    /** 该等级解锁的加成。 */
    buffs: string[];
}
/** 舰娘详情，阵营、舰种和稀有度已转换为中文；未找到舰船时为空对象。 */
export interface ShipDetail extends Partial<Ship> {}
/** 舰娘列表条目。 */
export interface ShipListItem {
    /** 舰船资源 ID。 */
    id: string;
    /** 舰级。 */
    classify: string;
    /** 各语言的舰船名称。 */
    names: ShipNames;
    /** 舰船缩略图地址。 */
    thumbnail: string;
    /** 舰种，如：驱逐。 */
    hullType: string;
    /** 阵营，如：白鹰。 */
    nationality: string;
    /** 稀有度，如：精锐。 */
    rarity: string;
}
/** 舰船皮肤配置。 */
export interface ShipSkin {
    /** 立绘资源名，用于匹配 Spine 资源目录。 */
    painting: string;
    /** 所属舰船分组 ID，对应舰船的 _gid。 */
    ship_group: number;
    /** 皮肤名称。 */
    name: string;
}
/** Spine 模型资源地址。 */
export interface SpineResult {
    /** 纹理图集描述文件地址。 */
    atlas: string;
    /** 纹理图片地址。 */
    texture: string;
    /** 二进制骨骼文件地址，文件存在时返回。 */
    skelBinary?: string;
    /** JSON 骨骼文件地址，文件存在时返回。 */
    skelJson?: string;
}
/** Spine 模型列表条目。 */
export interface SpineListItem {
    /** 舰船中文名。 */
    name: string;
    /** Spine 模型 ID，用于查询模型信息。 */
    value: string;
    /** 皮肤名称或形态说明，如：改、誓约。 */
    remark?: string;
}
export interface AzurlaneShipListsQuery {
    /**
     * @description 名称
     * @example 拉菲
     */
    name?: string;
    /**
     * @description 阵营：白鹰、皇家、重樱、铁血、东煌、撒丁帝国、北方联合、自由鸢尾、维希教廷、其他
     * @example 白鹰
     */
    nationality?: string;
    /**
     * @description 船级：驱逐、轻巡、重巡、航母、战列、维修、潜艇、其他
     * @example 驱逐
     */
    hullType?: string;
    /**
     * @description 稀有度：普通、稀有、精锐、超稀有、海上传奇
     * @example 精锐
     */
    rarity?: string;
}
export interface AzurlaneShipQuery {
    /**
     * @description 舰娘ID
     * @example 019
     */
    id: string;
}
export interface AzurlaneSpineQuery {
    /** @description 模型ID */
    id: string;
    /** @description 是否使用 CDN，遵循现有接口的真值判断 */
    isuseCDN?: string;
}
