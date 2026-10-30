/** 碧蓝航线舰船资源数据。 */
export interface Ship {
    /** 舰船资源 ID。 */
    id: string;
    /** 舰船分组 ID，用于关联皮肤配置。 */
    _gid?: number;
    /** 上游舰种名称，返回时可转换为中文。 */
    hullType: string;
    /** 不同语言的舰船名称，至少包含中文名 cn。 */
    names: Record<string, string> & {
        /** 舰船中文名称。 */
        cn: string;
    };
    /** 上游阵营名称，返回时可转换为中文。 */
    nationality: string;
    /** 上游稀有度名称，返回时可转换为中文。 */
    rarity: string;
    /** 舰船缩略图地址。 */
    thumbnail: string;
    /** 舰船级别或分类。 */
    class: string;
    /** 保留数据源中的其他字段，不在此处假设其具体结构。 */
    [key: string]: unknown;
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
