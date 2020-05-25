import { VertexAttachment } from './Attachment';
import { Color } from '../utils';

/**
 * An attachment with vertices that make up a polygon. Can be used for hit detection, creating physics bodies, spawning particle
 * effects, and more.
 *
 * See {@link Tiny.spine.SkeletonBounds} and [Bounding Boxes](http://esotericsoftware.com/spine-bounding-boxes) in the Spine User
 * Guide.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spineVertexAttachment
 */
class BoundingBoxAttachment extends VertexAttachment {
  /**
   *
   * @param {string} name
   */
  constructor(name) {
    super(name);

    /**
     * @type {Tiny.spine.Color}
     */
    this.color = new Color(1, 1, 1, 1);
  }

  /**
   * @return {Tiny.spine.BoundingBoxAttachment}
   */
  copy() {
    const copy = new BoundingBoxAttachment(name);

    this.copyTo(copy);
    copy.color.setFromColor(this.color);

    return copy;
  }
}

export default BoundingBoxAttachment;
