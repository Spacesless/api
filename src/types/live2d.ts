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
/** Live2D 模型配置，资源地址已由 Controller 转换为可访问的路径。 */
export interface Live2dModel {
    /** 配置类型，如：Live2D Model Setting。 */
    type?: string;
    /** 模型标识名称。 */
    name?: string;
    /** 模型标签。 */
    label?: string;
    /** 配置版本。 */
    version?: string;
    /** MOC 模型文件地址。 */
    model: string;
    /** 纹理文件地址列表；未找到材质时可能为 undefined。 */
    textures: string[] | undefined;
    /** 画布布局。 */
    layout?: Live2dLayout;
    /** 自定义点击区域。 */
    hit_areas_custom?: Live2dHitAreas;
    /** 姿势配置文件地址。 */
    pose?: string;
    /** 物理效果配置文件地址。 */
    physics?: string;
    /** 音频资源地址。 */
    sounds?: string;
    /** 动作组，键为动作组名（如 idle、tap_body）。 */
    motions?: Live2dMotionGroups;
    /** 表情列表。 */
    expressions?: Live2dExpression[];
}
/** Live2D 画布布局。 */
export interface Live2dLayout {
    /** 中心点横坐标。 */
    center_x: number;
    /** 中心点纵坐标。 */
    center_y: number;
    /** 宽度。 */
    width: number;
    /** 高度。 */
    height?: number;
}
/** Live2D 自定义点击区域，每项为 [最小值, 最大值]。 */
export interface Live2dHitAreas {
    /** 头部区域横坐标范围。 */
    head_x: number[];
    /** 头部区域纵坐标范围。 */
    head_y: number[];
    /** 身体区域横坐标范围。 */
    body_x: number[];
    /** 身体区域纵坐标范围。 */
    body_y: number[];
}
/** Live2D 动作组，键为动作组名。 */
export interface Live2dMotionGroups {
    [group: string]: Live2dMotion[];
}
/** Live2D 动作。 */
export interface Live2dMotion {
    /** 动作文件地址。 */
    file: string;
    /** 淡入时长（毫秒）。 */
    fade_in?: number;
    /** 淡出时长（毫秒）。 */
    fade_out?: number;
    /** 动作配套的音频文件地址。 */
    sound?: string;
    /** 对话编号。 */
    dialogue?: number;
}
/** Live2D 表情。 */
export interface Live2dExpression {
    /** 表情名称。 */
    name: string;
    /** 表情配置文件地址。 */
    file: string;
}
/** Live2D 模型列表分组。 */
export interface Live2dListGroup {
    /** 分组 ID。 */
    id: number;
    /** 分组名称。 */
    name: string;
    /** 分组下的模型。 */
    children: Live2dListItem[];
}
/** Live2D 模型列表条目。 */
export interface Live2dListItem {
    /** 模型 ID。 */
    id: number;
    /** 模型名称。 */
    name: string;
    /** 模型附带的展示信息。 */
    message?: string;
    /** 模型来源说明。 */
    from?: string;
    /** 材质数量，材质 ID 取值范围为 1-total；模型没有材质列表时不返回。 */
    total?: number;
}
/** 切换模型的结果。 */
export interface Live2dModelResult {
    /** 模型 ID。 */
    id: number;
    /** 模型附带的展示信息。 */
    message?: string;
}
/** 切换材质的结果。 */
export interface Live2dTextureResult {
    /** 模型 ID。 */
    id: number;
    /** 材质 ID；没有更多材质时为 0。 */
    texture: number;
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
