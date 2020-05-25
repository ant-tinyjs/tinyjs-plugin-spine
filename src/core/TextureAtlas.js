/* eslint-disable no-useless-constructor */
import { Texture, TextureRegion, TextureFilter, TextureWrap } from './Texture';

/**
 * @name Disposable
 * @memberof Tiny.spine
 * @interface
 */
/**
 * @function
 * @name Tiny.spine.Disposable#dispose
 */

/**
 * @class
 * @memberof Tiny.spine
 * @implements {Tiny.spine.Disposable}
 */
class TextureAtlas {
  /**
   *
   * @param {?string} atlasText
   * @param {?function} textureLoader
   * @param {?function} callback
   */
  constructor(atlasText, textureLoader, callback) {
    /**
     * @member {Tiny.spine.TextureAtlasPage[]}
     * @default []
     */
    this.pages = [];
    /**
     * @member {Tiny.spine.TextureAtlasRegion[]}
     * @default []
     */
    this.regions = [];

    if (atlasText) {
      this.addSpineAtlas(atlasText, textureLoader, callback);
    }
  }

  /**
   *
   * @param {string} name
   * @param {Tiny.Texture} texture
   */
  addTexture(name, texture) {
    const pages = this.pages;
    let page = null;

    for (let i = 0; i < pages.length; i++) {
      if (pages[i].baseTexture === texture.baseTexture) {
        page = pages[i];
        break;
      }
    }
    if (page === null) {
      page = new TextureAtlasPage();
      page.name = 'texturePage';

      const baseTexture = texture.baseTexture;

      page.width = baseTexture.realWidth;
      page.height = baseTexture.realHeight;
      page.baseTexture = baseTexture;
      //those fields are not relevant in TinyJS
      page.minFilter = page.magFilter = TextureFilter.Nearest;
      page.uWrap = TextureWrap.ClampToEdge;
      page.vWrap = TextureWrap.ClampToEdge;
      pages.push(page);
    }

    const region = new TextureAtlasRegion();

    region.name = name;
    region.page = page;
    region.texture = texture;
    region.index = -1;
    this.regions.push(region);
    return region;
  }

  /**
   *
   * @param {object<Tiny.Texture>} textures
   * @param {boolean} stripExtension
   */
  addTextureHash(textures, stripExtension) {
    for (let key in textures) {
      if (textures.hasOwnProperty(key)) {
        this.addTexture(stripExtension && key.indexOf('.') !== -1 ? key.substr(0, key.lastIndexOf('.')) : key, textures[key]);
      }
    }
  }

  /**
   *
   * @param {string} atlasText
   * @param {function} textureLoader
   * @param {function} callback
   */
  addSpineAtlas(atlasText, textureLoader, callback) {
    return this.load(atlasText, textureLoader, callback);
  }

  /**
   * @private
   * @param {string} atlasText
   * @param {function} textureLoader
   * @param {function} callback
   */
  load(atlasText, textureLoader, callback) {
    if (textureLoader == null) {
      throw new Error('textureLoader cannot be null.');
    }

    const reader = new TextureAtlasReader(atlasText);
    const tuple = new Array(4);
    let page = null;
    let iterateParser = () => {
      while (true) {
        const self = this;
        let line = reader.readLine();

        if (line == null) {
          return callback && callback(self);
        }
        line = line.trim();
        if (line.length === 0) {
          page = null;
        } else if (!page) {
          page = new TextureAtlasPage();
          page.name = line;

          // size is only optional for an atlas packed with an old TexturePacker.
          if (reader.readTuple(tuple) === 2) {
            page.width = parseInt(tuple[0]);
            page.height = parseInt(tuple[1]);
            reader.readTuple(tuple);
          }

          reader.readTuple(tuple);
          page.minFilter = Texture.filterFromString(tuple[0]);
          page.magFilter = Texture.filterFromString(tuple[1]);

          const direction = reader.readValue();

          page.uWrap = TextureWrap.ClampToEdge;
          page.vWrap = TextureWrap.ClampToEdge;
          if (direction === 'x') {
            page.uWrap = TextureWrap.Repeat;
          } else if (direction === 'y') {
            page.vWrap = TextureWrap.Repeat;
          } else if (direction === 'xy') {
            page.uWrap = page.vWrap = TextureWrap.Repeat;
          }

          textureLoader(line, (texture) => {
            if (texture === null) {
              this.pages.splice(this.pages.indexOf(page), 1);

              return callback && callback(null);
            }
            page.baseTexture = texture;
            if (!texture.hasLoaded) {
              texture.width = page.width;
              texture.height = page.height;
            }
            this.pages.push(page);
            page.setFilters();

            if (!page.width || !page.height) {
              page.width = texture.realWidth;
              page.height = texture.realHeight;
              if (!page.width || !page.height) {
                console.log(`ERROR spine atlas page ${page.name}: meshes wont work if you dont specify size in atlas (http://www.html5gamedevs.com/topic/18888-pixi-spines-and-meshes/?p=107121)`);
              }
            }
            iterateParser();
          });
          this.pages.push(page);
          break;
        } else {
          const region = new TextureAtlasRegion();

          region.name = line;
          region.page = page;

          const rotateValue = reader.readValue();
          let rotate = 0;

          if (rotateValue.toLocaleLowerCase() === 'true') {
            rotate = 6;
          } else if (rotateValue.toLocaleLowerCase() === 'false') {
            rotate = 0;
          } else {
            rotate = ((720 - parseFloat(rotateValue)) % 360) / 45;
          }

          reader.readTuple(tuple);

          let x = parseInt(tuple[0]);
          let y = parseInt(tuple[1]);

          reader.readTuple(tuple);

          let width = parseInt(tuple[0]);
          let height = parseInt(tuple[1]);

          let resolution = page.baseTexture.resolution;

          x /= resolution;
          y /= resolution;
          width /= resolution;
          height /= resolution;

          const swapWH = rotate % 4 !== 0;
          let frame = new Tiny.Rectangle(x, y, swapWH ? height : width, swapWH ? width : height);

          if (reader.readTuple(tuple) === 4) { // split is optional
            if (reader.readTuple(tuple) === 4) { // pad is optional, but only present with splits
              reader.readTuple(tuple);
            }
          }

          let originalWidth = parseInt(tuple[0]) / resolution;
          let originalHeight = parseInt(tuple[1]) / resolution;
          reader.readTuple(tuple);
          let offsetX = parseInt(tuple[0]) / resolution;
          let offsetY = parseInt(tuple[1]) / resolution;

          let orig = new Tiny.Rectangle(0, 0, originalWidth, originalHeight);
          let trim = new Tiny.Rectangle(offsetX, originalHeight - height - offsetY, width, height);

          region.texture = new Tiny.Texture(region.page.baseTexture, frame, orig, trim, rotate);
          region.index = parseInt(reader.readValue());
          region.texture._updateUvs();

          this.regions.push(region);
        }
      }
    };

    iterateParser();
  }

  /**
   *
   * @param {string} name
   * @return {?Tiny.spine.TextureAtlasRegion}
   */
  findRegion(name) {
    for (let i = 0; i < this.regions.length; i++) {
      if (this.regions[i].name === name) {
        return this.regions[i];
      }
    }
    return null;
  }

  /**
   *
   */
  dispose() {
    for (let i = 0; i < this.pages.length; i++) {
      this.pages[i].baseTexture.dispose();
    }
  }
}

/**
 * @class
 * @memberof Tiny.spine
 */
class TextureAtlasPage {
  /**
   *
   */
  constructor() {
    /**
     * @name name
     * @memberof Tiny.spine.TextureAtlasPage.prototype
     * @type {string}
     */
    /**
     * @name magFilter
     * @memberof Tiny.spine.TextureAtlasPage.prototype
     * @type {Tiny.spine.TextureFilter}
     */
    /**
     * @name uWrap
     * @memberof Tiny.spine.TextureAtlasPage.prototype
     * @type {Tiny.spine.TextureWrap}
     */
    /**
     * @name vWrap
     * @memberof Tiny.spine.TextureAtlasPage.prototype
     * @type {Tiny.spine.TextureWrap}
     */
    /**
     * @name baseTexture
     * @memberof Tiny.spine.TextureAtlasPage.prototype
     * @type {Tiny.BaseTexture}
     */
    /**
     * @name width
     * @memberof Tiny.spine.TextureAtlasPage.prototype
     * @type {number}
     */
    /**
     * @name height
     * @memberof Tiny.spine.TextureAtlasPage.prototype
     * @type {number}
     */

    /**
     * for jsdoc
     *
     * @private
     */
    this._ = null;
  }
  /**
   *
   */
  setFilters() {
    const tex = this.baseTexture;
    const filter = this.minFilter;

    if (filter === TextureFilter.Linear) {
      tex.scaleMode = Tiny.SCALE_MODES.LINEAR;
    } else if (this.minFilter === TextureFilter.Nearest) {
      tex.scaleMode = Tiny.SCALE_MODES.NEAREST;
    } else {
      tex.mipmap = true;
      if (filter === TextureFilter.MipMapNearestNearest) {
        tex.scaleMode = Tiny.SCALE_MODES.NEAREST;
      } else {
        tex.scaleMode = Tiny.SCALE_MODES.LINEAR;
      }
    }
  }
}

/**
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.TextureRegion
 */
class TextureAtlasRegion extends TextureRegion {
  /**
   *
   */
  constructor() {
    /**
     * @name page
     * @memberof Tiny.spine.TextureAtlasRegion.prototype
     * @type {Tiny.spine.TextureAtlasPage}
     */
    /**
     * @name name
     * @memberof Tiny.spine.TextureAtlasRegion.prototype
     * @type {string}
     */
    /**
     * @name index
     * @memberof Tiny.spine.TextureAtlasRegion.prototype
     * @type {number}
     */
    super();
  }
}

/**
 * @class
 * @private
 */
class TextureAtlasReader {
  constructor(text) {
    this.index = 0;
    this.lines = text.split(/\r\n|\r|\n/);
  }

  readLine() {
    if (this.index >= this.lines.length) {
      return null;
    }
    return this.lines[this.index++];
  }

  readValue() {
    let line = this.readLine();
    let colon = line.indexOf(':');

    if (colon === -1) {
      throw new Error(`Invalid line: ${line}`);
    }
    return line.substring(colon + 1).trim();
  }

  readTuple(tuple) {
    let line = this.readLine();
    let colon = line.indexOf(':');

    if (colon === -1) {
      throw new Error(`Invalid line: ${line}`);
    }

    let i = 0;
    let lastMatch = colon + 1;

    for (; i < 3; i++) {
      const comma = line.indexOf(',', lastMatch);

      if (comma === -1) break;

      tuple[i] = line.substr(lastMatch, comma - lastMatch).trim();
      lastMatch = comma + 1;
    }
    tuple[i] = line.substring(lastMatch).trim();

    return i + 1;
  }
}

export {
  TextureAtlas,
  TextureAtlasPage,
  TextureAtlasRegion,
};
