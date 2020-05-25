import { Color } from './utils';

/**
 * Stores a slot's current pose. Slots organize attachments for {@link Tiny.spine.Skeleton#drawOrder} purposes and provide a place to store
 * state for an attachment. State cannot be stored in an attachment itself because attachments are stateless and may be shared
 * across multiple skeletons.
 *
 * @class
 * @memberof Tiny.spine
 */
class Slot {
  /**
   *
   * @param {Tiny.spine.SlotData} data
   * @param {Tiny.spine.Bone} bone
   */
  constructor(data, bone) {
    /**
     * Values to deform the slot's attachment. For an unweighted mesh, the entries are local positions for each vertex. For a
     * weighted mesh, the entries are an offset for each vertex which will be added to the mesh's local vertex positions.
     *
     * See {@link Tiny.spine.VertexAttachment#computeWorldVertices} and {@link Tiny.spine.DeformTimeline}.
     *
     * @type {number[]}
     */
    this.deform = [];

    // this is for TinyJS
    /**
     * @name currentMesh
     * @memberof Tiny.spine.Slot.prototype
     * @type {*}
     */
    /**
     * @name currentSprite
     * @memberof Tiny.spine.Slot.prototype
     * @type {*}
     */
    /**
     * @name currentGraphics
     * @memberof Tiny.spine.Slot.prototype
     * @type {*}
     */
    /**
     * @name clippingContainer
     * @memberof Tiny.spine.Slot.prototype
     * @type {*}
     */
    /**
     * @name meshes
     * @memberof Tiny.spine.Slot.prototype
     * @type {*}
     */
    /**
     * @name currentMeshName
     * @memberof Tiny.spine.Slot.prototype
     * @type {string}
     */
    /**
     * @name sprites
     * @memberof Tiny.spine.Slot.prototype
     * @type {*}
     */
    /**
     * @name currentSpriteName
     * @memberof Tiny.spine.Slot.prototype
     * @type {string}
     */
    /**
     * @name hackRegion
     * @memberof Tiny.spine.Slot.prototype
     * @type {Tiny.spine.TextureRegion}
     */
    /**
     * @name hackAttachment
     * @memberof Tiny.spine.Slot.prototype
     * @type {Tiny.spine.Attachment}
     */
    /**
     * @name attachment
     * @memberof Tiny.spine.Slot.prototype
     * @type {Tiny.spine.Attachment}
     * @private
     */
    /**
     * @name attachmentTime
     * @memberof Tiny.spine.Slot.prototype
     * @type {number}
     * @private
     */

    if (data == null) {
      throw new Error('data cannot be null.');
    }
    if (bone == null) {
      throw new Error('bone cannot be null.');
    }
    /**
     * The slot's setup pose data.
     *
     * @type {Tiny.spine.SlotData}
     */
    this.data = data;
    /**
     * The bone this slot belongs to.
     *
     * @type {Tiny.spine.Bone}
     */
    this.bone = bone;
    /**
     * he color used to tint the slot's attachment. If {@link Tiny.spine.Slot#darkColor} is set, this is used as the light color for two
     * color tinting.
     *
     * @type {Tiny.spine.Color}
     */
    this.color = new Color();
    /**
     * The dark color used to tint the slot's attachment for two color tinting, or null if two color tinting is not used. The dark
     * color's alpha is not used.
     *
     * @type {Tiny.spine.Color}
     */
    this.darkColor = data.darkColor == null ? null : new Color();
    this.setToSetupPose();

    /**
     * @type {number}
     */
    this.blendMode = this.data.blendMode;
  }

  /**
   * The current attachment for the slot, or null if the slot has no attachment.
   *
   * @return {?Tiny.spine.Attachment}
   */
  getAttachment() {
    return this.attachment;
  }

  /**
   * Sets the slot's attachment and, if the attachment changed, resets {@link Tiny.spine.Slot#attachmentTime} and clears {@link Tiny.spine.Slot#deform}.
   *
   * @param {?Tiny.spine.Attachment} attachment
   */
  setAttachment(attachment) {
    if (this.attachment === attachment) {
      return;
    }
    this.attachment = attachment;
    this.attachmentTime = this.bone.skeleton.time;
    this.deform.length = 0;
  }

  /**
   *
   * @param {number} time
   */
  setAttachmentTime(time) {
    this.attachmentTime = this.bone.skeleton.time - time;
  }

  /**
   * The time that has elapsed since the last time the attachment was set or cleared. Relies on Skeleton
   * {@link Tiny.spine.Skeleton#time}.
   *
   * @return {number}
   */
  getAttachmentTime() {
    return this.bone.skeleton.time - this.attachmentTime;
  }

  /**
   * Sets this slot to the setup pose.
   */
  setToSetupPose() {
    this.color.setFromColor(this.data.color);
    if (this.darkColor != null) {
      this.darkColor.setFromColor(this.data.darkColor);
    }
    if (this.data.attachmentName == null) {
      this.attachment = null;
    } else {
      this.attachment = null;
      this.setAttachment(this.bone.skeleton.getAttachment(this.data.index, this.data.attachmentName));
    }
  }
}

export default Slot;
