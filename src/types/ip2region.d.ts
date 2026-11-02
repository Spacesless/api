import 'ip2region.js';

// 官方 3.1.8 已导出 verify，但尚未提供对应的类型声明。
declare module 'ip2region.js' {
  export function verify(fd: number): void;
}
