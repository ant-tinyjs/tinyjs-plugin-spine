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

var app = new Tiny.Application({
  dpi: 2,
  showFPS: true,
});
var loader = new Tiny.loaders.Loader();
var container = new Tiny.Container();

loader
  .add('spineRes', 'https://gw.alipayobjects.com/zos/tiny/owl/1.0.7/assets/spine/coin.json')
  .load(function() {
    var spineInstance = new spine.Spine(res.spineRes.spineData);

    container.addChild(spineInstance);

    var localRect = spineInstance.getLocalBounds();

    spineInstance.setPivot(container.width / 2, container.height / 2);
    spineInstance.setPosition(Tiny.WIN_SIZE.width / 2 - localRect.x, Tiny.WIN_SIZE.height / 2 - localRect.y);
    spineInstance.state.setAnimation(0, 'animation', true);
  });

app.run(container);
```

## 依赖
- `Tiny.js`: [Link](http://tinyjs.net/api)

## API文档

http://tinyjs.net/plugins/tinyjs-plugin-spine.html#docs

### loader 参数

``` js
// loader params
interface IMetadata {
  spineSkeletonScale?: number;  // 缩放
  spineAtlas?: any;
  spineAtlasSuffix?: string;    // 更改 atlas 文件的扩展名，如：.atlas（也是默认值）/.txt
  spineAtlasFile?: string;      // 使用自定义 atlas 文件链接，不使用和 .json 文件相对的拼接路径
  spineMetadata?: any;          // spine 自定义 metadata 属性值
  imageNamePrefix?: string;     // atlas 对应图片的文件名前缀，会拼接上 _atlas_page_，如：${name}_atlas_page_
  atlasRawData?: string;
  imageLoader?: any;
  images?: object<string, Tiny.Texture>;
  imageMetadata?: any;
  image?: Tiny.Texture;
}
```

#### 设置骨骼的缩放

``` js
// 将以原尺寸的 0.5 倍渲染骨骼动画
var loaderOptions = {
  metadata: {
    spineSkeletonScale: 0.5,
  },
}
```

#### 更改 atlas 文件扩展名

``` js
var loaderOptions = {
  metadata: {
    spineAtlasSuffix: '.txt',
  },
}

// 对应的 atlas 文件是 coin.txt
loader
  .add('spineRes', './coin.json', loaderOptions)
  .load(onAssetsLoaded);
```

#### 手动设置纹理图

``` js
loader
  .add({
    name: 'spineRes',
    url: './dragon.json',
    metadata: {
      // 单张纹理图
      image: Tiny.Texture.fromImage('https://xxx/dragon.png'),
      // 多张纹理图
      images: {
        // key 就是 atlas 图集里的图片路径名
        'dragon.png': Tiny.Texture.fromImage('https://xxx/dragon.png'),
        'dragon2.png': Tiny.Texture.fromImage('https://xxx/dragon2.png'),
      },
    }
  });
```

#### 定制纹理图片加载器

``` js
const imageMap = {
  'dragon.png': 'https://xxx/dragon.png',
  'dragon2.png': 'https://xxx/dragon2.png'
};

loader
  .add({
    name: 'spineRes',
    url: './res/dragon/dragon.json',
    metadata: {
      imageLoader: (loader, namePrefix, baseUrl, imageOptions) => {
        return function(line, callback) {
          const name = namePrefix + line;
          const url = imageMap[line];

          loader.add(name, url, imageOptions, resource => {
            if (!resource.error) {
              callback(resource.texture.baseTexture);
            } else {
              // polyfill or show error
              callback(null);
            }
          });
        }
      }
    }
  });
```

### 使用压缩纹理

此功能完整示例：`demo > alien.html`

``` js
var app = new Tiny.Application({
  dpi: 2,
  showFPS: true,
});
var loader = new Tiny.loaders.Loader();

// 初始化压缩纹理插件
Tiny.plugins.compressedTexture.init(app.renderer);
loader
  .add('spineRes', './res/alien/alien.json', {
    // 设置使用压缩纹理
    metadata: { useCompressedTexture: true }
  })
  .load(onAssetsLoaded);
```


### 更改 Texture

``` js
var spineInstance = new Tiny.spine.Spine(res.spineRes.spineData);
var texture = Tiny.Texture.fromImage('./ant.png');

spineInstance.hackTextureBySlotName('head', texture);

spineInstance.hackTextureBySlotName('arm', texture, { width: 100, height : 100 });

spineInstance.hackTextureBySlotIndex(7, texture, texture.orig || texture.frame);
```

### 预加载 json 和 atlas

``` js
var rawSkeletonData = JSON.parse('$jsonData');
var rawAtlasData = '$atlasData';

var spineAtlas = new Tiny.spine.TextureAtlas(rawAtlasData, function(line, callback) {
    callback(Tiny.BaseTexture.fromImage(`./res/owl/${line}`));
});

var spineAtlasLoader = new Tiny.spine.AtlasAttachmentLoader(spineAtlas)
var spineJSONParser = new Tiny.spine.SkeletonJSON(spineAtlasLoader);

spineJSONParser.scale = 0.5;

var spineData = spineJSONParser.readSkeletonData(rawSkeletonData);
var spineInstance = new Tiny.spine.Spine(spineData);
```

### 一个 atlas 多个骨骼

``` js
var preLoader = new Tiny.loaders.Loader();
var loader = new Tiny.loaders.Loader();

preLoader.add('mainSpine', './res/owl/main.json');
preLoader.load(() => {
  var options = {
    metadata: {
      spineAtlas: preLoader.resources['mainSpine'].spineAtlas
    }
  };

  loader
    .add('tree', './res/owl/tree.json', options)
    .add('bird', './res/owl/bird.json', options)
    .load(onAssetsLoaded)
});
```

### 事件

``` js
spineInstance.state.addListener({
  start: function(track) {
    console.log('start');
  },
  end: function(track) {
    console.log('end');
  },
  complete: function(track) {
    console.log('complete', Math.floor(track.trackTime) + ' times');
  },
  event: function(track, event) {
    console.log('Event on track ' + track.trackIndex + ': ' + JSON.stringify(event));
  },

  dispose: function(track) {
    console.log('animation was disposed at ' + track.trackIndex);
  },
  interrupted: function(track) {
    console.log('animation was interrupted at ' + track.trackIndex);
  }
});
```
