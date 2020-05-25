/**
 * @readonly
 * @enum {number}
 * @memberof Tiny.spine
 */
const TextureFilter = {
  Nearest: 9728, // WebGLRenderingContext.NEAREST
  Linear: 9729, // WebGLRenderingContext.LINEAR
  MipMap: 9987, // WebGLRenderingContext.LINEAR_MIPMAP_LINEAR
  MipMapNearestNearest: 9984, // WebGLRenderingContext.NEAREST_MIPMAP_NEAREST
  MipMapLinearNearest: 9985, // WebGLRenderingContext.LINEAR_MIPMAP_NEAREST
  MipMapNearestLinear: 9986, // WebGLRenderingContext.NEAREST_MIPMAP_LINEAR
  MipMapLinearLinear: 9987, // WebGLRenderingContext.LINEAR_MIPMAP_LINEAR
};

/**
 * @readonly
 * @enum {number}
 * @memberof Tiny.spine
 */
const TextureWrap = {
  MirroredRepeat: 33648, // WebGLRenderingContext.MIRRORED_REPEAT
  ClampToEdge: 33071, // WebGLRenderingContext.CLAMP_TO_EDGE
  Repeat: 10497, // WebGLRenderingContext.REPEAT
};

/**
 * @class
 * @abstract
 * @memberof Tiny.spine
 */
class Texture {
  /**
   *
   * @param {HTMLImageElement} image
   */
  constructor(image) {
    /**
     * @protected
     * @type {HTMLImageElement}
     */
    this._image = image;
  }

  /**
   * @return {HTMLImageElement}
   */
  getImage() {
    return this._image;
  }

  /**
   * @function
   * @abstract
   * @name Tiny.spine.Texture#setFilters
   * @param {Tiny.spine.TextureFilter} minFilter
   * @param {Tiny.spine.TextureFilter} magFilter
   */
  /**
   * @function
   * @abstract
   * @name Tiny.spine.Texture#setWraps
   * @param {Tiny.spine.TextureWrap} uWrap
   * @param {Tiny.spine.TextureWrap} vWrap
   */
  /**
   * @function
   * @abstract
   * @name Tiny.spine.Texture#dispose
   */

  /**
   *
   * @static
   * @param {string} text
   * @return {Tiny.spine.TextureFilter}
   */
  static filterFromString(text) {
    switch (text.toLowerCase()) {
      case 'nearest':
        return TextureFilter.Nearest;
      case 'linear':
        return TextureFilter.Linear;
      case 'mipmap':
        return TextureFilter.MipMap;
      case 'mipmapnearestnearest':
        return TextureFilter.MipMapNearestNearest;
      case 'mipmaplinearnearest':
        return TextureFilter.MipMapLinearNearest;
      case 'mipmapnearestlinear':
        return TextureFilter.MipMapNearestLinear;
      case 'mipmaplinearlinear':
        return TextureFilter.MipMapLinearLinear;
      default:
        throw new Error(`Unknown texture filter ${text}`);
    }
  }

  /**
   *
   * @static
   * @param {string} text
   * @return {Tiny.spine.TextureWrap}
   */
  static wrapFromString(text) {
    switch (text.toLowerCase()) {
      case 'mirroredtepeat':
        return TextureWrap.MirroredRepeat;
      case 'clamptoedge':
        return TextureWrap.ClampToEdge;
      case 'repeat':
        return TextureWrap.Repeat;
      default:
        throw new Error(`Unknown texture wrap ${text}`);
    }
  }
}

/**
 * @class
 * @memberof Tiny.spine
 */
class TextureRegion {
  /**
   *
   */
  constructor() {
    /**
     * @name texture
     * @type {Tiny.Texture}
     * @memberof Tiny.spine.TextureRegion.prototype
     */
    /**
     * @type {Tiny.Rectangle}
     * @default null
     */
    this.size = null;
  }

  /**
   * @member {number}
   * @readonly
   */
  get width() {
    const tex = this.texture;

    if (tex.trim) {
      return tex.trim.width;
    }
    return tex.orig.width;
  }

  /**
   * @member {number}
   * @readonly
   */
  get height() {
    const tex = this.texture;

    if (tex.trim) {
      return tex.trim.height;
    }
    return tex.orig.height;
  }

  /**
   * @member {number}
   * @readonly
   */
  get u() {
    return this.texture._uvs.x0;
  }

  /**
   * @member {number}
   * @readonly
   */
  get v() {
    return this.texture._uvs.y0;
  }

  /**
   * @member {number}
   * @readonly
   */
  get u2() {
    return this.texture._uvs.x2;
  }

  /**
   * @member {number}
   * @readonly
   */
  get v2() {
    return this.texture._uvs.y2;
  }

  /**
   * @member {number}
   * @readonly
   */
  get offsetX() {
    const tex = this.texture;

    return tex.trim ? tex.trim.x : 0;
  }

  /**
   * @member {number}
   * @readonly
   */
  get offsetY() {
    return this.spineOffsetY;
  }

  /**
   * @member {number}
   * @readonly
   */
  get tinyOffsetY() {
    const tex = this.texture;

    return tex.trim ? tex.trim.y : 0;
  }

  /**
   * @member {number}
   * @readonly
   */
  get spineOffsetY() {
    const tex = this.texture;

    return this.originalHeight - this.height - (tex.trim ? tex.trim.y : 0);
  }

  get originalWidth() {
    return this.texture.orig.width;
  }

  /**
   * @member {number}
   * @readonly
   */
  get originalHeight() {
    return this.texture.orig.height;
  }

  /**
   * @member {number}
   * @readonly
   */
  get x() {
    return this.texture.frame.x;
  }

  /**
   * @member {number}
   * @readonly
   */
  get y() {
    return this.texture.frame.y;
  }

  /**
   * @member {boolean}
   * @readonly
   */
  get rotate() {
    return this.texture.rotate !== 0;
  }
}

export {
  TextureFilter,
  TextureWrap,
  Texture,
  TextureRegion,
};
