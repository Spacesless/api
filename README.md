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
- Live2d模型 (***勿做商用哦***, Live2D Cubism SDK v2版本, 材质图片经过tinypng压缩)
- 中国行政区划联动 (只支持4级联动，需要5级联动找[https://github.com/modood/Administrative-divisions-of-China](https://github.com/modood/Administrative-divisions-of-China))
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
- 类型按业务放在 `src/types/sentence.ts`、`bing.ts`、`district.ts` 等文件中，同一业务的参数、响应数据和上游类型放在一起；分页、数据库公共类型放在 `src/types/common.ts`。Controller 通过 `getApiQuery<SentenceQuery>()` 显式引用参数类型，不需要维护全局路径表。字段说明写在对应属性的 JSDoc 中。直接 `this.get('参数')` 读取的参数也会被发现，缺少明确类型时按字符串记录。
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

## 古诗文数据与查询

诗歌模块使用 `chinese-gushiwen` 数据集，包含 10,000 篇古诗文、3,983 位作者和 10,000 条名句。三个 GET 接口分别读取独立的 MongoDB 集合：

| 接口 | 数据目录 | 集合 | 业务筛选参数 |
| --- | --- | --- | --- |
| `/poetry` | `guwen/` | `poetry_guwen` | `author`、`dynasty`、`type`、`keyword` |
| `/poetry/writer` | `writer/` | `poetry_writer` | `name`、`keyword` |
| `/poetry/sentence` | `sentence/` | `poetry_sentence` | `from`、`keyword` |

三个接口均支持 `page`、`pageSize`，不提供 ID 查询。页码默认 1，每页默认 10 条、最多 50 条，按 `_id` 升序排列。查询始终返回现有分页结构：`data` 中包含 `count`、`totalPages`、`pageSize`、`currentPage` 和记录数组 `data`；没有匹配时数组为空。

示例（请求时中文参数应正常 URL 编码）：

```text
/poetry?author=李白&dynasty=唐代&type=乐府&pageSize=10
/poetry/writer?name=李白
/poetry/sentence?keyword=天生我材&from=李白
```

`author`、作者姓名、名句出处和关键词使用字面内容模糊匹配，不将用户输入作为正则表达式执行；朝代和分类精确匹配。古诗文关键词搜索标题、正文、分类；作者关键词搜索姓名、简介；名句关键词搜索原文、出处。

数据文件是每行一条记录的 JSON（JSON Lines），不是 JSON 数组。后续导入 MongoDB 时，把各目录下所有文件分别导入表中的集合，并保留 Extended JSON 的 `_id.$oid` 为 MongoDB ObjectId。不要导入到“一言”使用的 `sentence` 集合。本次代码调整没有导入或修改数据库。

返回字段保留数据源的名称：古诗文为 `title/dynasty/writer/content/type`，可选字段有 `remark/shangxi/translation/audioUrl`；作者为 `name/headImageUrl/simpleIntro/detailIntro`，其中 `detailIntro` 保留原始字符串，不自动解析为对象；名句为 `name/from`。数据没有作者 ID 或作品 ID 关联，`writer` 和 `from` 都是文字。

此次更新替换了旧诗歌数据结构：`/poetry` 路径和 `author` 查询参数保留，但响应不再使用旧的 `author/paragraphs/tags/prologue` 字段，旧 `poetry` 集合也不再读取。使用新接口前需要完成三个集合的数据导入，并按新字段调整调用方。

## 汉字词典、歇后语与对联

词典模块使用 `chinese-xinhua` 的两份数据文件，暂不替换现有成语接口，也未新增词语接口：

| 接口 | 数据文件 | MongoDB 集合 | 业务筛选参数 |
| --- | --- | --- | --- |
| `/dictionary/word` | `word.json` | `dictionary_word` | `word`、`radicals`、`strokes`、`keyword` |
| `/dictionary/xiehouyu` | `xiehouyu.json` | `dictionary_xiehouyu` | `riddle`、`answer`、`keyword` |
| `/dictionary/couplet` | 对联 `data.csv` | `dictionary_couplet` | `up`、`down`、`keyword` |

三者均支持 `page`、`pageSize`，不提供 ID 查询。统一返回分页数据，默认每页 10 条、最多 50 条，按 `_id` 升序排列。所有关键词都是字面内容，不执行用户提供的正则表达式。

```text
/dictionary/word?word=乐
/dictionary/word?word=樂
/dictionary/word?radicals=口&strokes=13
/dictionary/xiehouyu?riddle=飞机上聊天
/dictionary/xiehouyu?answer=高谈阔论
/dictionary/couplet?up=晚风摇树树还挺
/dictionary/couplet?down=晨露润花花更红
/dictionary/couplet?keyword=春风
```

汉字数据共 16,142 条记录、14,810 个不同字头；同一个字可能有多条读音或释义记录，不能把 `word` 设为唯一键。`word` 参数同时精确匹配 `word` 和 `oldword`，后者是数据源的原字形，可能是繁体或异体字。部首精确匹配，但有 9,044 条记录缺少部首。笔画查询参数使用整数，查询时转换成源数据的字符串格式；拼音、释义及换行按原样返回。

歇后语有 14,032 条记录，前半句和答案均可按字面内容模糊查询，`keyword` 同时搜索两者。答案中的多个表述及标点不拆分、不改写。

对联 CSV 有 774,491 条记录，表头为 `up,down`，分别是上联和下联。`up`、`down` 参数使用原文精确匹配（包含标点），`keyword` 同时搜索上下联。响应保留 `up`、`down` 和导入后生成的 `_id`；同一上联的多个已有下联分别返回。本接口只检索已有数据，不调用生成模型，也不承诺给任意新上联创作下联。

对联文件有 5,088 条完全重复记录，可以按完整的 `(up, down)` 配对去重，但不能按 `up` 单独去重或建立唯一索引，否则会丢失同一上联的其他下联。导入时使用支持引号、逗号和换行的标准 CSV 解析器，不要直接按逗号切分。建议为上联和下联精确查询分别建立包含 `_id` 排序字段的普通索引；关键词检索仍是模糊查询，不能保证与精确查询相同的性能。

这两份 JSON 文件都是数组，与古诗文的 JSON Lines 格式不同。导入时按数组格式处理，并让 MongoDB 为没有 `_id` 的记录分配 ObjectId。重复导入会产生重复记录，建议在新集合中准备数据再切换；不要依据字头直接覆盖多条记录。本次仅修改接口代码，没有导入数据库。

可选的 `ci.json` 有 264,434 条词语记录，仅包含 `ci` 和 `explanation`，适合后续提供简单的查词释义接口。数据有 52 个同名词条包含不同释义、3 条完全重复记录及 28 条空释义，应整理有效释义后再导入，避免按词名去重时丢失含义。

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

构建阶段需要开发依赖。部署时保留完整的 `app/` 编译目录，以及 `package.json`、`www/`（包含生成的 `openapi.json`）、`view/` 和本地 `config/`。生产入口已改为 `app/production.js`，PM2 示例也已同步更新；现有 PM2 进程的启动路径需要相应调整。

可以参考deploy目录下的nginx或pm2配置进行部署
