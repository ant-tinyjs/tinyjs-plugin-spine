/**
 * @class
 * @memberof Tiny.spine
 */
class Color {
  /**
   *
   * @param {number} r=0
   * @param {number} g=0
   * @param {number} b=0
   * @param {number} a=0
   */
  // eslint-disable-next-line no-useless-constructor
  constructor(r = 0, g = 0, b = 0, a = 0) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  /**
   *
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @param {number} a
   * @return {Tiny.spine.Color}
   */
  set(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.clamp();
    return this;
  }

  /**
   *
   * @param {Tiny.spine.Color} c
   * @return {Tiny.spine.Color}
   */
  setFromColor(c) {
    this.r = c.r;
    this.g = c.g;
    this.b = c.b;
    this.a = c.a;
    return this;
  }

  /**
   *
   * @param {string} hex
   * @return {Tiny.spine.Color}
   */
  setFromString(hex) {
    hex = hex.charAt(0) === '#' ? hex.substr(1) : hex;
    this.r = parseInt(hex.substr(0, 2), 16) / 255.0;
    this.g = parseInt(hex.substr(2, 2), 16) / 255.0;
    this.b = parseInt(hex.substr(4, 2), 16) / 255.0;
    this.a = (hex.length !== 8 ? 255 : parseInt(hex.substr(6, 2), 16)) / 255.0;
    return this;
  }

  /**
   *
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @param {number} a
   * @return {Tiny.spine.Color}
   */
  add(r, g, b, a) {
    this.r += r;
    this.g += g;
    this.b += b;
    this.a += a;
    this.clamp();
    return this;
  }

  /**
   * @return {Tiny.spine.Color}
   */
  clamp() {
    if (this.r < 0) this.r = 0;
    else if (this.r > 1) this.r = 1;

    if (this.g < 0) this.g = 0;
    else if (this.g > 1) this.g = 1;

    if (this.b < 0) this.b = 0;
    else if (this.b > 1) this.b = 1;

    if (this.a < 0) this.a = 0;
    else if (this.a > 1) this.a = 1;
    return this;
  }

  /**
   *
   * @param {Tiny.spine.Color} color
   * @param {number} value
   * @static
   */
  static rgba8888ToColor(color, value) {
    color.r = ((value & 0xff000000) >>> 24) / 255;
    color.g = ((value & 0x00ff0000) >>> 16) / 255;
    color.b = ((value & 0x0000ff00) >>> 8) / 255;
    color.a = ((value & 0x000000ff)) / 255;
  }

  /**
   *
   * @param {Tiny.spine.Color} color
   * @param {number} value
   * @static
   */
  static rgb888ToColor(color, value) {
    color.r = ((value & 0x00ff0000) >>> 16) / 255;
    color.g = ((value & 0x0000ff00) >>> 8) / 255;
    color.b = ((value & 0x000000ff)) / 255;
  }
}

/**
 * @static
 */
Color.WHITE = new Color(1, 1, 1, 1);
/**
 * @static
 */
Color.RED = new Color(1, 0, 0, 1);
/**
 * @static
 */
Color.GREEN = new Color(0, 1, 0, 1);
/**
 * @static
 */
Color.BLUE = new Color(0, 0, 1, 1);
/**
 * @static
 */
Color.MAGENTA = new Color(1, 0, 1, 1);

export {
  Color,
};
