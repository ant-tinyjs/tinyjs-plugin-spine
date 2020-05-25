import { PowOut, degrees2Radians } from '../utils';

/**
 * @class
 * @memberof Tiny.spine
 */
class SwirlEffect {
  /**
   *
   * @param {number} radius
   */
  constructor(radius) {
    /**
     * @type {number}
     */
    this.radius = radius;
    /**
     * @type {number}
     * @default 0
     */
    this.centerX = 0;
    /**
     * @type {number}
     * @default 0
     */
    this.centerY = 0;
    /**
     * @type {number}
     * @default 0
     */
    this.radius = 0;
    /**
     * @type {number}
     * @default 0
     */
    this.angle = 0;
    /**
     * @type {number}
     * @default 0
     */
    this.worldX = 0;
    /**
     * @type {number}
     * @default 0
     */
    this.worldY = 0;
    /**
     * @type {number}
     * @default 0
     */
  }

  /**
   *
   * @param {Tiny.spine.Skeleton} skeleton
   */
  begin(skeleton) {
    this.worldX = skeleton.x + this.centerX;
    this.worldY = skeleton.y + this.centerY;
  }

  /**
   *
   * @param {Tiny.spine.Vector2} position
   * @param {Tiny.spine.Vector2} uv
   * @param {Tiny.spine.Color} light
   * @param {Tiny.spine.Color} dark
   */
  transform(position, uv, light, dark) {
    const radAngle = this.angle * degrees2Radians;
    const x = position.x - this.worldX;
    const y = position.y - this.worldY;
    const dist = Math.sqrt(x * x + y * y);

    if (dist < this.radius) {
      const theta = SwirlEffect.interpolation.apply(0, radAngle, (this.radius - dist) / this.radius);
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      position.x = cos * x - sin * y + this.worldX;
      position.y = sin * x + cos * y + this.worldY;
    }
  }

  /**
   *
   */
  end() {}
}

/**
 * @static
 * @constant
 * @type {Tiny.spine.PowOut}
 * @default new Tiny.spine.PowOut(2)
 */
SwirlEffect.interpolation = new PowOut(2);

export default SwirlEffect;
