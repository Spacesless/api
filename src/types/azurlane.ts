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
export interface AzurlaneSpineQuery {
    /** @description 模型ID */
    id: string;
    /** @description 是否使用 CDN，遵循现有接口的真值判断 */
    isuseCDN?: string;
}
