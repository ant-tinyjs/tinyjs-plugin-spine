/**
 * @class
 * @memberof Tiny.spine
 */

class Vector3 {
  /**
   *
   * @param {number} x=0
   * @param {number} y=0
   * @param {number} z=0
   */
  constructor(x = 0, y = 0, z = 0) {
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
    /**
     * @type {number}
     * @default 0
     */
    this.z = z;
  }

  setFrom(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;

    return this;
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;

    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;

    return this;
  }

  scale(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;

    return this;
  }

  normalize() {
    let len = this.length();

    if (len === 0) return this;

    len = 1 / len;
    this.x *= len;
    this.y *= len;
    this.z *= len;

    return this;
  }

  cross(v) {
    return this.set(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x)
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  distance(v) {
    let a = v.x - this.x;
    let b = v.y - this.y;
    let c = v.z - this.z;

    return Math.sqrt(a * a + b * b + c * c);
  }
}

export {
  Vector3,
};
