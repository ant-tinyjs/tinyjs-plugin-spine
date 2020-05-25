import { Color } from './utils';

/**
 * Stores the setup pose for a {@link Tiny.spine.Slot}.
 *
 * @class
 * @memberof Tiny.spine
 */
class SlotData {
  /**
   *
   * @param {number} index
   * @param {string} name
   * @param {Tiny.spine.BoneData} boneData
   */
  constructor(index, name, boneData) {
    /**
     * The color used to tint the slot's attachment. If {@link Tiny.spine.SlotData#darkColor} is set, this is used as the light color for two
     * color tinting.
     *
     * @type {Tiny.spine.Color}
     */
    this.color = new Color(1, 1, 1, 1);

    /**
     * The dark color used to tint the slot's attachment for two color tinting, or null if two color tinting is not used. The dark
     * color's alpha is not used.
     *
     * @name darkColor
     * @memberof Tiny.spine.SlotData.prototype
     * @type {Tiny.spine.Color}
     */

    /**
     * The name of the attachment that is visible for this slot in the setup pose, or null if no attachment is visible.
     *
     * @name attachmentName
     * @memberof Tiny.spine.SlotData.prototype
     * @type {string}
     */

    /**
     * The blend mode for drawing the slot's attachment.
     *
     * @name blendMode
     * @memberof Tiny.spine.SlotData.prototype
     * @type {Tiny.spine.BlendMode}
     */

    if (index < 0) {
      throw new Error('index must be >= 0.');
    }
    if (name == null) {
      throw new Error('name cannot be null.');
    }
    if (boneData == null) {
      throw new Error('boneData cannot be null.');
    }
    /**
     * The index of the slot in {@link Tiny.spine.Skeleton#slots}.
     *
     * @type {number}
     */
    this.index = index;
    /**
     * The name of the slot, which is unique across all slots in the skeleton.
     *
     * @type {string}
     */
    this.name = name;
    /**
     * The bone this slot belongs to.
     *
     * @type {Tiny.spine.BoneData}
     */
    this.boneData = boneData;
  }
}

export default SlotData;
