# tinyjs-plugin-spine

> Spine implementation for TinyJS

## 查看demo

http://tinyjs.net/plugins/tinyjs-plugin-spine.html#demo

## 引用方法

- 推荐作为依赖使用

  - `npm install tinyjs-plugin-spine --save`

- 也可以直接引用线上cdn地址，注意要使用最新的版本号，例如：

  - https://gw.alipayobjects.com/os/lib/tinyjs-plugin-spine/1.0.0/index.js
  - https://gw.alipayobjects.com/os/lib/tinyjs-plugin-spine/1.0.0/index.debug.js

## 起步
首先当然是要引入，推荐`NPM`方式，当然你也可以使用`CDN`或下载独立版本，先从几个例子入手吧！

##### 1、最简单的例子

引用 Tiny.js 源码
``` html
<script src="https://gw.alipayobjects.com/os/lib/tinyjs/tiny/1.3.1/tiny.js"></script>
```
``` js
var spine = require('tinyjs-plugin-spine');
// 或者
// import spine from 'tinyjs-plugin-spine';
```

## 依赖
- `Tiny.js`: [Link](http://tinyjs.net/api)

## API文档

http://tinyjs.net/plugins/tinyjs-plugin-spine.html#docs

``` js
// loader params
interface IMetadata {
  spineSkeletonScale?: number;  // 缩放
  spineAtlas?: any;
  spineAtlasSuffix?: string;    // 如：.atlas（也是默认值）
  spineAtlasFile?: string;      // 使用自定义 atlas 文件链接，不使用和 .json 文件相对的拼接路径
  spineMetadata?: any;          // spine 自定义 metadata 属性值
  imageNamePrefix?: string;     // atlas 对应图片的文件名前缀，会拼接上 _atlas_page_，如：${name}_atlas_page_
  atlasRawData?: string;
  imageLoader?: any;
  images?: any;
  imageMetadata?: any;
  image?: any;
}
```
