# 一个公共Api服务

基于Node.js搭建的Api服务，服务器资源有限，少量请求可免费使用，如果帮到您可以点个star或者请我喝杯咖啡。

数据来源于聚合数据、Github等社区，以文件或MongoDB方式存储，不定期更新数据源。

Api文档看这吧：[https://api.timelessq.com](https://api.timelessq.com)

## 技术栈

- Think.js (Node.js框架)
- TypeScript（严格类型检查，编译为 CommonJS）
- MongoDB
- Axios
- Apifox

## 功能特性
- 时间 (公历，农历，老黄历，十二时辰，基于[https://github.com/6tail/lunar-javascript](https://github.com/6tail/lunar-javascript))
- 动画番组数据 (按年、月、动画名称查询, 基于[https://github.com/bangumi-data/bangumi-data](https://github.com/bangumi-data/bangumi-data))
- QQ音乐 (通过QQ号查歌单, 通过歌单id查音乐列表, 查询带秘钥的音乐地址、歌词, 音乐搜索)
- Live2d模型 (***勿做商用哦***, Live2D Cubism SDK v2版本, 材质图片经过tinypng压缩)
- 中国行政区划联动 (只支持4级联动，需要5级联动找[https://github.com/modood/Administrative-divisions-of-China](https://github.com/modood/Administrative-divisions-of-China))
- 垃圾分类 (可回收物、有害垃圾、湿垃圾、干垃圾、大件垃圾, 基于[https://github.com/alexayan/garbage-classification-data](https://github.com/alexayan/garbage-classification-data))
- 中国邮政编码
- 中国车牌号及其简称
- 成语大全、成语接龙
- 等等

## 快速开始
使用 Node.js 22 或更高版本。

安装依赖
```
npm install
```
安装MongoDB，使用deploy目录下的api_bson数据文件

```
npm start
```

开发模式会将 TypeScript 编译到 `app/`，编译成功后启动或重启服务。入口为 `development.ts`，业务源码位于 `src/`。不要直接运行源码或编辑 `app/` 中的编译产物。

MongoDB 连接配置仍从项目根目录的 `config/adapter.model.js` 读取，现有部署配置无需转换；静态资源、模板、日志和运行目录也仍以项目根目录为基准。

检查类型、构建和运行离线回归测试：

```sh
npm run typecheck
npm run build
npm test
```

测试覆盖编译后的 ThinkJS 模块加载、部分本地接口和参数校验，以及每日英语主备源回退，不请求外部数据源或写入 MongoDB。上线前仍需验证数据库接口、上游接口和资源文件。

## 接口文档与类型

首页通过 Swagger UI 展示本项目的接口文档，支持搜索、在线调试和下载 OpenAPI，不依赖个人 Apifox 项目。在线请求使用当前部署地址；`/openapi.json` 返回原始规范，对应 `www/openapi.json`。应用提供该地址的路由，也可由 Nginx 直接映射为静态文件。页面的 Swagger UI JS/CSS 来自固定版本的 jsDelivr CDN，浏览器需要能访问该 CDN。现有 `/docs` 和 Nginx 配置由部署方自行管理。

`www/openapi.json` 现在是自动生成文件，不要手工编辑。开发模式每次编译成功后、生产构建时都会重新生成，也可以单独运行：

```sh
npm run docs:generate
```

文档来源于应用代码：

- Controller 的 `*Action` 方法决定接口列表；遵循 ThinkJS 默认路径，并识别 `src/config/router.ts` 中的字面量路由别名。定时任务、更新资源等方法用 `/** @internal */` 排除（仅影响文档可见性）。
- 类型按业务放在 `src/types/sentence.ts`、`bing.ts`、`bilibili.ts` 等文件中，同一业务的参数、响应数据和上游类型放在一起；分页、数据库公共类型放在 `src/types/common.ts`。Controller 通过 `getApiQuery<SentenceQuery>()` 显式引用参数类型，不需要维护全局路径表。字段说明写在对应属性的 JSDoc 中。直接 `this.get('参数')` 读取的参数也会被发现，缺少明确类型时按字符串记录。
- 同名 Logic 的 `scope` 和 Action 中的 `this.rules` 提供必填、整数范围、枚举、长度和格式约束；`allowMethods` 决定 HTTP 方法，未指定时按当前服务约定记录为 GET。条件必填通过 `x-required-if` 保留；动态规则表达式会使生成失败，需扩展生成器支持。
- `this.success(data)` 的实参类型决定成功响应字段；`this.body` 与图片重定向也会被提取。复杂或复用的数据在对应业务文件中声明类型，简单响应可以直接推导。业务含义写在 Action 的 `@summary`、`@description` 中。

新增或修改接口时，修改 Controller、参数类型与实际校验规则即可，构建会更新文档。请为外部 JSON、Axios 和数据库结果声明准确的类型；`any`/`unknown` 无法推断真实字段，生成器会保留动态结构并输出提示，不会请求线上接口来猜测数据。它不会分析任意 helper 的响应副作用、动态路由或运行时生成的规则，目前也不提取请求体；遇到这类接口应扩展提取逻辑。

`docs:generate` 只生成 `www/openapi.json`，无需额外生成接口声明文件。修改应用类型后可检查：

```sh
npm run typecheck
```

运行时校验继续由原有 Logic 执行；TypeScript 类型声明不会自动校验外部 JSON。

新增接口示例：在 `src/types/hello.ts` 声明参数，然后在 Controller 中使用。

```ts
// src/types/hello.ts
export interface HelloQuery {
  /** 用户名称 */
  name: string;
}

// src/controller/hello.ts
import type { HelloQuery } from '../types/hello';
import Base = require('./base');

export = class extends Base {
  /** @summary 问候 */
  indexAction() {
    const { name } = this.getApiQuery<HelloQuery>();
    return this.success({ message: `你好，${name}` });
  }
};
```

该接口按默认路由对应 `GET /hello`；在 `src/logic/hello.ts` 中按现有写法添加 `name` 的必填和长度校验。开发编译或构建时会自动生成参数和响应文档，不使用装饰器。

## 线上部署
```sh
npm install
npm run build
npm prune --omit=dev
npm run start:prod
```

构建阶段需要开发依赖。部署时保留完整的 `app/` 编译目录，以及 `package.json`、`www/`（包含生成的 `openapi.json`）、`view/` 和本地 `config/`。生产入口已改为 `app/production.js`，PM2 示例也已同步更新；现有 PM2 进程的启动路径需要相应调整。

可以参考deploy目录下的nginx或pm2配置进行部署
