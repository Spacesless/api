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

## 接口类型

`openapi.json` 是对外接口契约，`src/types/openapi.d.ts` 为生成文件。修改文档后执行：

```sh
npm run types:api
npm run typecheck
```

Controller 通过 `getApiQuery('/接口路径')` 获取对应的参数类型；运行时校验继续由原有 Logic 执行。采集响应、本地 JSON 资源和 MongoDB 扩展的类型位于 `src/types/`。这些类型声明不会自动校验外部 JSON。

`think-ts/` 仅为迁移参考项目，不参与编译。

## 线上部署
```sh
npm install
npm run build
npm prune --omit=dev
npm run start:prod
```

构建阶段需要开发依赖。部署时保留完整的 `app/` 编译目录，以及 `package.json`、`www/`、`view/` 和本地 `config/`。生产入口已改为 `app/production.js`，PM2 示例也已同步更新；现有 PM2 进程的启动路径需要相应调整。

可以参考deploy目录下的nginx或pm2配置进行部署
