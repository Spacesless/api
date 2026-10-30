export interface QrCodeQuery {
    /**
     * @description 二维码内容
     * @example https://api.timelessq.com/
     */
    text: string;
    /** @description 返回模式，1:直接返回二维码图像 2:base64编码PNG 3:SVG字符串，默认1 */
    type?: number;
    /**
     * @description 纠错级别：low, medium, quartile, highL, M, Q, H，默认M
     * @example Q
     */
    el?: string;
    /**
     * @description 外边距，默认4
     * @example 2
     */
    margin?: number;
    /**
     * @description 缩放比例，每个黑点的像素，默认4
     * @example
     */
    scale?: number;
    /**
     * @description 强制输出图像的特定宽度
     * @example 256
     */
    width?: number;
    /**
     * @description 前景色代码，例如：000000
     * @example 66ccff
     */
    fgColor?: string;
    /**
     * @description 背景色代码，例如：ffffff
     * @example ffffff
     */
    bgColor?: string;
    /** @description 二维码纠错级别（当前实现使用的参数名） */
    errorCorrectionLevel?: "low" | "medium" | "quartile" | "high" | "L" | "M" | "Q" | "H";
    /** @description 图片编码质量 */
    quality?: number;
}
