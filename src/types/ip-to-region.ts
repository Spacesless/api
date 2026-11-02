/** IP 归属地，IP 库中查不到的字段为空字符串。 */
export interface IpRegion {
    /** 查询的 IP 地址。 */
    ip: string;
    /** 国家，如：中国。 */
    country: string;
    /** 省份，如：广东省。 */
    province: string;
    /** 城市，如：深圳市。 */
    city: string;
    /** 运营商，如：电信。 */
    isp: string;
}
export type IpVersion = 4 | 6;

export interface IpToRegionQuery {
    /** @description IPv4 或 IPv6 地址，须与 version 一致；不传取客户端 IP */
    ip?: string;
    /** @description IP 版本：4（默认）或 6 */
    version?: IpVersion;
}
