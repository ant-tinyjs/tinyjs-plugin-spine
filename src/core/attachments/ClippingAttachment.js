import { VertexAttachment } from './Attachment';
import { Color } from '../utils';

/**
 * An attachment with vertices that make up a polygon used for clipping the rendering of other attachments.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.VertexAttachment
 */
class ClippingAttachment extends VertexAttachment {
  /**
   *
   * @param {string} name
   */
  constructor(name) {
    super(name);

    /**
     * Clipping is performed between the clipping polygon's slot and the end slot. Returns null if clipping is done until the end of
     * the skeleton's rendering.
     *
     * @name endSlot
     * @type {Tiny.spine.SlotData}
     * @memberof Tiny.spine.ClippingAttachment.prototype
     */

    /**
     * The color of the clipping polygon as it was in Spine. Available only when nonessential data was exported. Clipping polygons
     * are not usually rendered at runtime.
     *
     * @type {Tiny.spine.Color}
     */
    this.color = new Color(0.2275, 0.2275, 0.8078, 1); // ce3a3aff
  }

  /**
   * @return {Tiny.spine.ClippingAttachment}
   */
  copy() {
    const copy = new ClippingAttachment(name);

    this.copyTo(copy);
    copy.endSlot = this.endSlot;
    copy.color.setFromColor(this.color);

    return copy;
  }
}

export default ClippingAttachment;
