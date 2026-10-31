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
export interface IpToRegionQuery {
    /** @description IPv4地址，不传取请求体携带的地址 */
    ip?: string;
}
