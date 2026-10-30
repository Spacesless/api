/** 常用电话号码信息。 */
export interface PhoneNumber {
    /** 电话号码分类。 */
    cate: string;
    /** 机构或服务名称。 */
    name: string;
    /** 电话号码，使用字符串保留格式。 */
    tel: string;
}
export interface PhoneNumberQuery {
    /**
     * @description 分类
     * @example 公共服务
     */
    cate?: "公共服务" | "中央党政部门" | "国家监督机构" | "保险公司" | "汽车公司" | "通信服务" | "铁路航空" | "银行机构" | "常用企业" | "外卖订餐" | "快递物流" | "常用大学";
    /**
     * @description 根据名称、电话号码查询
     * @example 报警
     */
    keyword?: string;
}
