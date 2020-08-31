![](http://nodejs.cn/static/nodejs-logo-light-mode-d8cbf6c670c6befc286bc5c456b20f39.svg)

#### 一个基于nodejs(thinkjs)开发的api应用包括以下:
- 时间 (公历, 农历, 老黄历, 基于[https://github.com/6tail/lunar-javascript](https://github.com/6tail/lunar-javascript))
- 动画番组数据 (按年、月、动画名称查询, 基于[https://github.com/bangumi-data/bangumi-data](https://github.com/bangumi-data/bangumi-data))
- QQ音乐 (通过QQ号查歌单, 通过歌单id查音乐列表, 查询带秘钥的音乐地址、歌词, 音乐搜索)
- Live2d模型 (***勿做商用***, Live2D Cubism SDK v2版本, 材质图片经过tinypng压缩)
- 中国行政区划联动 (只支持4级联动，需要5级联动找[https://github.com/modood/Administrative-divisions-of-China](https://github.com/modood/Administrative-divisions-of-China))
- 垃圾分类 (可回收物、有害垃圾、湿垃圾、干垃圾、大件垃圾, 基于[https://github.com/alexayan/garbage-classification-data](https://github.com/alexayan/garbage-classification-data))
- 中国邮政编码
- 中国车牌号及其简称

## Documenet
文档先看swagger吧 :tw-1f60b:
[https://api.timelessq.com](https://api.timelessq.com)

## 快速开始

```
npm install
npm start
```
## 线上部署
```
npm install --production
node production.js
```
