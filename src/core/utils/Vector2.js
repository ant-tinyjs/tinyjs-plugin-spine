/**
 * @class
 * @memberof Tiny.spine
 */
class Vector2 {
  /**
   *
   * @param {number} x=0
   * @param {number} y=0
   */
  constructor(x = 0, y = 0) {
    /**
     * @type {number}
     * @default 0
     */
    this.x = x;

    /**
     * @type {number}
     * @default 0
     */
    this.y = y;
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   * @return {Tiny.spine.Vector2}
   */
  set(x, y) {
    this.x = x;
    this.y = y;

    return this;
  }

  /**
   * @return {number}
   */
  length() {
    const x = this.x;
    const y = this.y;

    return Math.sqrt(x * x + y * y);
  }

  /**
   * @return {Tiny.spine.Vector2}
   */
  normalize() {
    const len = this.length();

    if (len !== 0) {
      this.x /= len;
      this.y /= len;
    }

    return this;
  }
}

export {
  Vector2,
};
