import { randomTriangular } from '../utils';

/**
 * @class
 * @memberof Tiny.spine
 */
class JitterEffect {
  /**
   *
   * @param {number} jitterX=0
   * @param {number} jitterY=0
   */
  constructor(jitterX = 0, jitterY = 0) {
    /**
     * @type {number}
     * @default 0
     */
    this.jitterX = jitterX;
    /**
     * @type {number}
     * @default 0
     */
    this.jitterY = jitterY;
  }

  /**
   *
   * @param {Tiny.spine.Skeletion} skeleton
   */
  begin(skeleton) {}

  /**
   *
   * @param {Tiny.spine.Vector2} position
   * @param {Tiny.spine.Vector2} uv
   * @param {Tiny.spine.Color} light
   * @param {Tiny.spine.Color} dark
   */
  transform(position, uv, light, dark) {
    position.x += randomTriangular(-this.jitterX, this.jitterY);
    position.y += randomTriangular(-this.jitterX, this.jitterY);
  }

  /**
   *
   */
  end() {}
}

export default JitterEffect;
