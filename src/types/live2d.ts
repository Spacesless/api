/** Live2D 模型目录条目或分组节点。 */
export interface Live2dEntry {
    /** 模型条目或分组 ID。 */
    id: number;
    /** 展示名称。 */
    name: string;
    /** 资源目录配置中的路径标记。 */
    path?: string;
    /** 单个模型目录，或可切换的多个模型目录。 */
    models: string | string[];
    /** 模型附带的展示信息。 */
    message?: string;
    /** 模型来源说明。 */
    from?: string;
    /** 分组下的模型条目。 */
    children?: Live2dEntry[];
}
/** Live2D 模型配置，资源地址可由 Controller 转换。 */
export interface Live2dModel {
    /** MOC 模型文件路径。 */
    model: string;
    /** 纹理文件地址列表；未找到材质时可能为 undefined。 */
    textures: string[] | undefined;
    /** 姿势配置文件路径。 */
    pose?: string;
    /** 物理效果配置文件路径。 */
    physics?: string;
    /** 音频资源路径。 */
    sounds?: string;
    /** 动作组配置，保留原始 JSON 结构。 */
    motions?: unknown;
    /** 表情组配置，保留原始 JSON 结构。 */
    expressions?: unknown;
    /** 保留数据源中的其他字段，不在此处假设其具体结构。 */
    [key: string]: unknown;
}
/** 一套材质配置：单个文件，或需要一起加载的多个文件。 */
export type TextureList = string | string[];
export interface Live2dGetQuery {
    /**
     * @description 模型id
     * @example 100
     */
    id: string;
    /**
     * @description 材质id
     * @example 1
     */
    texture: string;
}
export interface Live2dModelSwitchQuery {
    /**
     * @description 模型id
     * @example 100
     */
    id: string;
}
export interface Live2dModelRandomQuery {
    /**
     * @description 模型id
     * @example 100
     */
    id: number;
}
export interface Live2dTextureSwitchQuery {
    /**
     * @description 模型id
     * @example
     */
    id: string;
    /** @description 材质id */
    texture: string;
}
export interface Live2dTextureRandomQuery {
    /**
     * @description 模型id
     * @example
     */
    id: string;
}
