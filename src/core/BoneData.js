import { Color } from './utils';

/**
 * Determines how a bone inherits world transforms from parent bones.
 *
 * @readonly
 * @enum {number}
 * @memberof Tiny.spine
 */
const TransformMode = {
  Normal: 0,
  OnlyTranslation: 1,
  NoRotationOrReflection: 2,
  NoScale: 3,
  NoScaleOrReflection: 4,
};

/**
 * Stores the setup pose for a {@link Tiny.spine.Bone}.
 *
 * @class
 * @memberof Tiny.spine
 */
class BoneData {
  /**
   *
   * @param {number} index
   * @param {string} name
   * @param {Tiny.spine.BoneData} parent
   */
  constructor(index, name, parent) {
    /**
     * The bone's length.
     *
     * @name length
     * @memberof Tiny.spine.BoneData.prototype
     * @type {number}
     */

    /**
     * The local x translation.
     *
     * @member {number}
     * @default 0
     */
    this.x = 0;
    /**
     * The local y translation.
     *
     * @member {number}
     * @default 0
     */
    this.y = 0;
    /**
     * The local rotation.
     *
     * @member {number}
     * @default 0
     */
    this.rotation = 0;
    /**
     * The local scaleX.
     *
     * @member {number}
     * @default 1
     */
    this.scaleX = 1;
    /**
     * The local scaleY.
     *
     * @member {number}
     * @default 1
     */
    this.scaleY = 1;
    /**
     * The local shearX.
     *
     * @member {number}
     * @default 0
     */
    this.shearX = 0;
    /**
     * The local shearY.
     *
     * @member {number}
     * @default 0
     */
    this.shearY = 0;
    /**
     * The transform mode for how parent world transforms affect this bone.
     *
     * @member {Tiny.spine.TransformMode}
     * @default Tiny.spine.TransformMode.Normal
     */
    this.transformMode = TransformMode.Normal;
    /**
     * When true, {@link Tiny.spine.Skeleton#updateWorldTransform} only updates this bone if the {@link Tiny.spine.Skeleton#skin} contains this
     * bone.
     *
     * @see Tiny.spine.Skin#bones
     * @member {boolean}
     * @default false
     */
    this.skinRequired = false;
    /**
     * The color of the bone as it was in Spine. Available only when nonessential data was exported. Bones are not usually
     * rendered at runtime.
     *
     * @member {Tiny.spine.Color}
     */
    this.color = new Color();

    if (index < 0) {
      throw new Error('index must be >= 0.');
    }
    if (name == null) {
      throw new Error('name cannot be null.');
    }
    /**
     * The index of the bone in {@link Tiny.spine.Skeleton#bones}
     *
     * @member {number}
     */
    this.index = index;
    /**
     * The name of the bone, which is unique across all bones in the skeleton.
     *
     * @member {string}
     */
    this.name = name;
    /**
     * @member {?Tiny.spine.BoneData}
     */
    this.parent = parent;
  }
}

export {
  TransformMode,
  BoneData,
};
