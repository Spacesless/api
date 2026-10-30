export interface CryptoHashMd5Query {
    /**
     * @description 要处理的信息
     * @example Timeless
     */
    message: string;
    /**
     * @description 返回的长度：16、32等。默认返回算法生成的全部信息
     * @example
     */
    size?: number;
    /** @description 大小写，upper：大写、lower：小写。默认返回小写 */
    textCase?: string;
}
export interface CryptoHashShaQuery {
    /**
     * @description 要处理的信息
     * @example Timeless
     */
    message: string;
    /** @description 哈希算法，1、256、512，默认256 */
    algorithm?: number;
}
export interface CryptoHashUuidQuery {
    /** @description UUID版本，1：时间戳、4：随机，默认4 */
    version?: number;
    /** @description 输出多少组的UUID，默认1 */
    count?: number;
    /** @description 大小写，upper：大写、lower：小写。默认返回小写 */
    textCase?: string;
}
export interface CryptoCipherQuery {
    /**
     * @description 要加、解密的信息
     * @example 相合之物
     */
    message: string;
    /**
     * @description 秘钥
     * @example Timeless
     */
    secret: string;
    /**
     * @description 加密算法，AES、DES、TripleDES、Rabbit、RC4、RC4Drop
     * @example AES
     */
    algorithm: string;
    /** @description 0：加密、1：解密，默认0 */
    type?: number;
}
export interface CryptoEncoderQuery {
    /**
     * @description 要处理的信息
     * @example cryptojs
     */
    message: string;
    /**
     * @description 处理算法，Base64、Hex、Utf8、Utf16
     * @example Base64
     */
    algorithm: string;
    /** @description 0：加密、1：解密，默认加密 */
    type?: number;
}
