import { VertexAttachment } from './Attachment';
import { Color, arrayCopy } from '../utils';

/**
 * An attachment whose vertices make up a composite Bezier curve.
 *
 * See {@link PathConstraint} and [Paths](http://esotericsoftware.com/spine-paths) in the Spine User Guide.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.VertexAttachment
 */
class PathAttachment extends VertexAttachment {
  /**
   *
   * @param {string} name
   */
  constructor(name) {
    super(name);

    /**
     * The lengths along the path in the setup pose from the start of the path to the end of each Bezier curve.
     *
     * @name lengths
     * @type {number[]}
     * @memberof Tiny.spine.PathAttachment.prototype
     */

    /**
     * If true, the start and end knots are connected.
     *
     * @type {boolean}
     * @default false
     */
    this.closed = false;

    /**
     * If true, additional calculations are performed to make calculating positions along the path more accurate. If false, fewer
     * calculations are performed but calculating positions along the path is less accurate.
     *
     * @type {boolean}
     * @default false
     */
    this.constantSpeed = false;

    /**
     * The color of the path as it was in Spine. Available only when nonessential data was exported. Paths are not usually
     * rendered at runtime.
     *
     * @type {Tiny.spine.Color}
     */
    this.color = new Color(1, 1, 1, 1);
  }

  /**
   * @return {Tiny.spine.Attachment}
   */
  copy() {
    const copy = new PathAttachment(name);

    this.copyTo(copy);
    copy.lengths = new Array(this.lengths.length);
    arrayCopy(this.lengths, 0, copy.lengths, 0, this.lengths.length);
    copy.closed = closed;
    copy.constantSpeed = this.constantSpeed;
    copy.color.setFromColor(this.color);

    return copy;
  }
}

export default PathAttachment;
