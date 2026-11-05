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
- Live2d模型 (***勿做商用哦***, Live2D Cubism SDK v2版本, 材质图片经过tinypng压缩)
- 中国行政区划：直接使用 province-city-china 本地数据，支持四级懒加载、前缀搜索、详情路径和地区树，无需 MongoDB，见 [接口说明](#行政区划接口)
- 垃圾分类 (可回收物、有害垃圾、湿垃圾、干垃圾、大件垃圾, 基于[https://github.com/alexayan/garbage-classification-data](https://github.com/alexayan/garbage-classification-data))
- 中国邮政编码
- 中国车牌号及其简称
- 成语大全、成语接龙
- 古诗文、作者资料、名句查询（支持分页和关键词筛选）
- 汉字词典、歇后语、对联查询（支持部首、笔画筛选、歇后语答案反查及已有上下联检索）
- 等等

## 快速开始
使用 Node.js 22 或更高版本。

安装依赖
```
npm install
```
数据库与大型静态资源从 [数据 Releases](https://github.com/Spacesless/api/releases) 按需下载，具体校验、解压和恢复方式见 [数据和静态资源安装](#数据和静态资源安装)。数据库压缩包、IP数据库、Live2D模型和宠物图片不再随源码分发；部署配置、小型JSON和Swagger保留在仓库。

使用数据库接口时安装MongoDB并恢复下载的BSON备份；仅使用行政区划等本地功能无需导入该备份。静态资源包在项目根目录解压，保持原有www目录结构。

```
npm start
```

维护者可使用 `npm run assets:pack` 复制现成数据库备份、打包静态资源并自动校验；部署时使用 `npm run assets:install` 完成校验和安装。输出目录为 `deploy/release-assets/`，不会进入Git。

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

首页通过 Swagger UI 展示本项目的接口文档，支持搜索、在线调试和下载 OpenAPI，不依赖个人 Apifox 项目。在线请求使用当前部署地址；`/swagger/openapi.json` 返回原始规范，对应 `www/swagger/openapi.json`，由 Nginx 直接作为静态文件提供（开发模式由 resource 中间件提供）。页面的 Swagger UI JS/CSS（swagger-ui-dist@5.17.14）已下载到 `www/swagger/`，不依赖外部 CDN；升级时手动替换这两个文件。现有 `/docs` 和 Nginx 配置由部署方自行管理。

`www/swagger/openapi.json` 现在是自动生成文件，不要手工编辑。开发模式每次编译成功后、生产构建时都会重新生成，也可以单独运行：

```sh
npm run docs:generate
```

文档来源于应用代码：

- Controller 的 `*Action` 方法决定接口列表；遵循 ThinkJS 默认路径，并识别 `src/config/router.ts` 中的字面量路由别名。定时任务、更新资源等方法用 `/** @internal */` 排除（仅影响文档可见性）。
- 类型按业务放在 `src/types/sentence.ts`、`bing.ts`、`district.ts` 等文件中，同一业务的参数、响应数据和上游类型放在一起；分页、数据库公共类型放在 `src/types/common.ts`。Controller 通过 `getApiQuery<SentenceQuery>()` 显式引用参数类型，不需要维护全局路径表。字段说明写在对应属性的 JSDoc 中。直接 `this.get('参数')` 读取的参数也会被发现，缺少明确类型时按字符串记录。
- 同名 Logic 的 `scope` 和 Action 中的 `this.rules` 提供必填、整数范围、枚举、长度和格式约束；`allowMethods` 决定 HTTP 方法，未指定时按当前服务约定记录为 GET。条件必填通过 `x-required-if` 保留；动态规则表达式会使生成失败，需扩展生成器支持。
- `this.success(data)` 的实参类型决定成功响应字段；`this.body` 与图片重定向也会被提取。复杂或复用的数据在对应业务文件中声明类型，简单响应可以直接推导。业务含义写在 Action 的 `@summary`、`@description` 中。

新增或修改接口时，修改 Controller、参数类型与实际校验规则即可，构建会更新文档。请为外部 JSON、Axios 和数据库结果声明准确的类型；`any`/`unknown` 无法推断真实字段，生成器会保留动态结构并输出提示，不会请求线上接口来猜测数据。它不会分析任意 helper 的响应副作用、动态路由或运行时生成的规则，目前也不提取请求体；遇到这类接口应扩展提取逻辑。

`docs:generate` 只生成 `www/swagger/openapi.json`，无需额外生成接口声明文件。修改应用类型后可检查：

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

## 数据预处理

`scripts/prepare-mongodb-data.cjs` 可以将上述古诗文 JSON Lines、新华词典 JSON 数组和对联 CSV 转换为统一的 UTF-8 标准 JSON 数组（`.json` 文件）。不连接数据库、不修改源文件；递归移除 `_id`，删除移除 ID 后完全相同的文档，保留同字多音、同词多释义、同一上联的不同下联以及原始文本格式。对联额外剔除上联或下联少于 5 字的记录，字数按 Unicode 字符统计，不计标点、符号和空白。

```sh
npm run data:prepare -- --poetry-root "D:/datasets/chinese-gushiwen-master" --dictionary-root "D:/datasets/chinese-xinhua-master/data" --couplets "D:/datasets/data.csv" --out "output/mongodb-import-json"
```

输出目录必须尚不存在，防止覆盖已有结果。目录下包含六个当前接口对应的集合文件、`manifest.json`（源条数、去重数、短对联剔除数、空字段、校验条数和 SHA-256）及独立的导入说明。词语和源成语放在 `optional/`，避免误导入当前使用其他结构的成语集合。所有输出通过 `JSON.parse` 校验为标准数组，并检查无 `_id`，生成结果位于已被 Git 忽略的 `output/` 下。

每个数据集只输出一个完整 JSON 数组文件，不生成分片。导入时可用数据库驱动读取数组、分批写入集合，文件本身无需拆分。不含 `_id` 的文件重复导入会追加记录；准备好目标空集合后再导入。预处理不代表数据已经进入 MongoDB。较大文件不能直接使用有 [16 MB 输入限制的 `mongoimport --jsonArray`](https://www.mongodb.com/docs/database-tools/mongoimport/)。

## 线上部署
```sh
npm install
npm run build
npm prune --omit=dev
npm run start:prod
```

构建阶段需要开发依赖。部署时保留完整的 `app/` 编译目录，以及 `package.json`、`www/`（包含生成的 `swagger/openapi.json`）、`view/` 和本地 `config/`。使用资源打包和安装工具时，同时保留 `scripts/` 和 `deploy/`；这些工具只需要Node和下文注明的系统命令，不依赖开发包。生产入口为 `app/production.js`，PM2示例也已同步更新。

可以参考deploy目录下的nginx或pm2配置进行部署

## 数据和静态资源安装

大型数据通过 [GitHub Releases](https://github.com/Spacesless/api/releases) 附件分发，源码仓库保留代码、配置、小型JSON、Swagger和Spine资源来源及清单。Releases用于下载，运行时仍从本地原目录读取，不作为图片或模型CDN。

行政区划直接使用province-city-china npm包，不需要下载地理边界数据或导入district集合。本项目不提供边界、经纬度归属或坐标转换服务。

### 附件

| 附件 | 安装位置 | 影响功能 |
| --- | --- | --- |
| api_bson_mongodb_data.7z | 由部署者手动恢复到MongoDB | 从www原样复制的数据库备份 |
| ip2region.tar.gz | www/ip2region/ | IPv4/IPv6归属查询 |
| live2d-assets.tar.gz | www/live2d-assets/ | Live2D列表及模型、贴图、动作 |
| pet-images.tar.gz | www/pet-images/ | 宠物接口中的本地图片地址 |
| Spine资源（上游下载） | www/azurlane-assets/spine/ | 从[Pelom777/AzurLaneSD](https://github.com/Pelom777/AzurLaneSD)自行下载 |
| manifest.json | 无需安装 | 附件和原文件的SHA256、大小、打包来源提交 |
| SHA256SUMS.txt | 无需安装 | 附件校验值 |

按需安装，不使用某模块则不需要下载对应附件。Live2D模型沿用原项目的“勿做商用”说明，数据与资源的来源及使用条件不因打包发布而改变。Spine资源体积较大，不在本项目Release中分发，也不参与assets:pack或assets:install。

使用Spine接口时，从[Pelom777/AzurLaneSD](https://github.com/Pelom777/AzurLaneSD)下载资源，将上游[assets/spine目录](https://github.com/Pelom777/AzurLaneSD/tree/master/assets/spine)复制到本项目 `www/azurlane-assets/spine/`，保持模型子目录结构。Spine接口的清单spine-list.json需要与模型内容对应。

### 下载与校验

打开上述Releases页面，选择明确的数据版本，下载需要的附件和SHA256SUMS.txt。数据版本与应用版本分开管理。请记录使用的版本，不依赖latest隐式更新。也可在安装GitHub CLI并登录后下载：

```sh
gh release download <数据版本标签> --repo Spacesless/api --dir deploy/release-assets --pattern 'ip2region.tar.gz' --pattern 'manifest.json' --pattern 'SHA256SUMS.txt'
```

Windows用PowerShell计算校验值，与SHA256SUMS.txt对应行比较：

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath deploy/release-assets/ip2region.tar.gz
```

Linux可在完整下载本次全部附件后运行 `sha256sum -c SHA256SUMS.txt`；仅下载部分附件时，只校验对应条目。

### 自动安装静态资源

将需要的tar.gz、manifest.json和SHA256SUMS.txt放到 `deploy/release-assets/`，在项目根目录执行：

```sh
npm run assets:install

# 只安装某个已下载的附件
npm run assets:install -- --only ip2region.tar.gz

# 内容不同时，先备份旧资源目录再更新
npm run assets:install -- --overwrite
```

安装命令只处理已下载的静态资源附件；数据库不会随之还原。系统需要tar（Windows自带tar或Linux tar）。脚本先校验manifest、附件SHA256及解压后的每个文件，拒绝路径越界、链接和清单外文件，所有选中附件通过检查后才安装到对应www目录。

相同内容会跳过，内容不同默认报错，使用 `--overwrite` 时将旧目录保存在 `deploy/resource-backups/时间标识/www/...`，再以新目录替换。不会清理旧备份。安装需要容纳解压临时目录的磁盘空间；更新时还需要保留旧目录。完成更新后重启Node，尤其是缓存了IP数据库索引的进程。未安装对应资源的接口仍不可用，图片未安装时静态URL会404。

### 数据库手动导入导出

数据库由部署者使用宝塔或MongoDB Database Tools手动导入导出。项目的打包、安装、构建和启动均不连接数据库执行备份或还原。

使用MongoDB Database Tools时，可参考以下gzip archive示例，连接地址和数据库名按实际部署调整：

```sh
# 手动导出
mongodump --uri="mongodb://127.0.0.1:27017" --db=api --archive=deploy/release-assets/api.archive.gz --gzip

# 手动导入，建议使用空的目标数据库
mongorestore --uri="mongodb://127.0.0.1:27017" --archive=deploy/release-assets/api.archive.gz --gzip --nsInclude="api.*" --stopOnError
```

源、目标MongoDB与Database Tools版本需要兼容；导入不是事务，出错前可能已经写入部分记录。已有数据的覆盖方式由部署者自行决定。宝塔导出的文件按实际备份格式恢复。

将手动导出的现成备份放在 `www/api_bson_mongodb_data.7z`。assets:pack会原样复制到 `deploy/release-assets/`，加入manifest.json和SHA256SUMS.txt，随静态资源一起发布。assets:install只安装静态资源，不解压或还原数据库。该7z不是mongodump --archive文件，恢复时先用7-Zip解压，再按实际BSON目录格式手动恢复；其他格式的手动备份也可以单独上传。

### 维护者打包和发布

准备好 `www/api_bson_mongodb_data.7z` 和三类必需静态资源。运行以下命令打包并自动校验：

```sh
npm run assets:pack
```

文件生成到忽略目录 `deploy/release-assets/`。脚本原样复制现成数据库7z、打包IP数据、Live2D和宠物图片，生成manifest.json和SHA256SUMS.txt，再校验附件和解压后的每个资源文件。数据库7z只校验字节一致，不自动解压或导入。Spine始终从上游单独下载，即使本地已安装也不会打包。数据库导入导出独立手动操作，打包不需要MongoDB连接或MongoDB工具。

manifest.json和SHA256SUMS.txt列出本次复制的数据库7z和生成的静态附件。输出目录中的其他手动备份和旧附件保持原样，不会自动纳入清单。归档不包含连接配置、凭据或日志。

创建独立数据Release（建议标签assets-YYYY.MM.DD），附件上传完整后再发布。不要把数据Release设为应用的latest版本。上传manifest.json列出的全部附件（包括api_bson_mongodb_data.7z），以及manifest.json、README.md、SHA256SUMS.txt。

大文件已提交过的历史不会因为移到Releases而消失；本次迁移不重写Git历史。本地安装文件由.gitignore忽略，迁移取消Git跟踪时应保留本地文件。普通完整克隆仍包含旧历史，新的部署可使用浅克隆减少历史下载。
