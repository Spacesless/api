# 一个公共Api服务

基于Node.js搭建的Api服务，基本上是自用。

数据来源于聚合数据、Github等社区，以文件或MongoDB方式存储，不定期更新数据源。

Api文档看这吧：[https://api.timelessq.com](https://api.timelessq.com)

## 技术栈

- Think.ks (Node.js框架)
- MongoDB
- Axios

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
安装依赖
```
npm install
```
安装MongoDB，使用deploy目录下的api_bson数据文件

```
npm start
```

## 线上部署
```
npm install --production
node production.js
```

参考deploy目录下的nginx或pm2配置进行部署