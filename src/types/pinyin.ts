export interface PinyinQuery {
    /**
     * @description 中文字符
     * @example 着急
     */
    text: string;
    /** @description 0：普通、1：声调、2：tone2音标、3、声母、4：首字母、5：to3ne音标，默认普通 */
    style?: number;
    /** @description 是否启用分词模式，0：不使用，1：使用，默认不使用 */
    segment?: number;
    /** @description 是否启用多音字模式，0：不使用，1：使用，默认不使用 */
    heteronym?: number;
    /** @description 是否按词组分组拼音，0：不使用，1：使用，默认不开启 */
    group?: number;
    /** @description 拼音模式，0：普通模式、1：姓名模式，默认普通模式。 */
    mode?: number;
    /** @description 是否返回紧凑模式，0：关闭，1：开启，默认关闭。开启时多音字可能的各种组合排列后返回 */
    compact?: number;
}
