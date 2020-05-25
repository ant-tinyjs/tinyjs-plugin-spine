import { VertexAttachment } from './Attachment';
import { Color, cosDeg, sinDeg, radDeg } from '../utils';

/**
 * An attachment which is a single point and a rotation. This can be used to spawn projectiles, particles, etc. A bone can be
 * used in similar ways, but a PointAttachment is slightly less expensive to compute and can be hidden, shown, and placed in a
 * skin.
 *
 * See [Point Attachments](http://esotericsoftware.com/spine-point-attachments) in the Spine User Guide.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.VertexAttachment
 */
class PointAttachment extends VertexAttachment {
  /**
   *
   * @param {string} name
   */
  constructor(name) {
    super(name);

    /**
     * @name x
     * @memberof Tiny.spine.PointAttachment.prototype
     * @type {number}
     */
    /**
     * @name y
     * @memberof Tiny.spine.PointAttachment.prototype
     * @type {number}
     */
    /**
     * @name rotation
     * @memberof Tiny.spine.PointAttachment.prototype
     * @type {number}
     */

    /**
     * The color of the point attachment as it was in Spine. Available only when nonessential data was exported. Point attachments
     * are not usually rendered at runtime.
     *
     * @type {Tiny.spine.Color}
     */
    this.color = new Color(0.38, 0.94, 0, 1);
  }

  /**
   *
   * @param {Tiny.spine.Bone} bone
   * @param {Tiny.spine.Vector2} point
   * @return {Tiny.spine.Vector2}
   */
  computeWorldPosition(bone, point) {
    const mat = bone.matrix;

    point.x = this.x * mat.a + this.y * mat.c + bone.worldX;
    point.y = this.x * mat.b + this.y * mat.d + bone.worldY;

    return point;
  }

  /**
   *
   * @param {Tiny.spine.Bone} bone
   * @return {number}
   */
  computeWorldRotation(bone) {
    const mat = bone.matrix;
    const cos = cosDeg(this.rotation);
    const sin = sinDeg(this.rotation);
    const x = cos * mat.a + sin * mat.c;
    const y = cos * mat.b + sin * mat.d;

    return Math.atan2(y, x) * radDeg;
  }

  /**
   * @return {Tiny.spine.Attachment}
   */
  copy() {
    const copy = new PointAttachment(name);

    copy.x = this.x;
    copy.y = this.y;
    copy.rotation = this.rotation;
    copy.color.setFromColor(this.color);

    return copy;
  }
}

export default PointAttachment;
