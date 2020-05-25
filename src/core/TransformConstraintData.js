import ConstraintData from './ConstraintData';

/**
 * Stores the setup pose for a {@link Tiny.spine.TransformConstraint}.
 *
 * See [Transform constraints](http://esotericsoftware.com/spine-transform-constraints) in the Spine User Guide.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.ConstraintData
 */
class TransformConstraintData extends ConstraintData {
  /**
   *
   * @param {string} name
   */
  constructor(name) {
    super(name, 0, false);

    /**
     * The bones that will be modified by this transform constraint.
     *
     * @type {Tiny.spine.BoneData}
     * @default []
     */
    this.bones = [];
    /**
     * The target bone whose world transform will be copied to the constrained bones.
     *
     * @name target
     * @memberof Tiny.spine.TransformConstraintData.prototype
     * @type {Tiny.spine.BoneData}
     */
    /**
     * A percentage (0-1) that controls the mix between the constrained and unconstrained rotations.
     *
     * @type {number}
     * @default 0
     */
    this.rotateMix = 0;
    /**
     * A percentage (0-1) that controls the mix between the constrained and unconstrained translations.
     *
     * @type {number}
     * @default 0
     */
    this.translateMix = 0;
    /**
     * A percentage (0-1) that controls the mix between the constrained and unconstrained scales.
     *
     * @type {number}
     * @default 0
     */
    this.scaleMix = 0;
    /**
     * A percentage (0-1) that controls the mix between the constrained and unconstrained shears.
     *
     * @type {number}
     * @default 0
     */
    this.shearMix = 0;
    /**
     * An offset added to the constrained bone rotation.
     *
     * @type {number}
     * @default 0
     */
    this.offsetRotation = 0;
    /**
     * An offset added to the constrained bone X translation.
     *
     * @type {number}
     * @default 0
     */
    this.offsetX = 0;
    /**
     * An offset added to the constrained bone Y translation.
     *
     * @type {number}
     * @default 0
     */
    this.offsetY = 0;
    /**
     * An offset added to the constrained bone scaleX.
     *
     * @type {number}
     * @default 0
     */
    this.offsetScaleX = 0;
    /**
     * An offset added to the constrained bone scaleY.
     *
     * @type {number}
     * @default 0
     */
    this.offsetScaleY = 0;
    /**
     * An offset added to the constrained bone shearY.
     *
     * @type {number}
     * @default 0
     */
    this.offsetShearY = 0;
    /**
     * @type {boolean}
     * @default false
     */
    this.relative = false;
    /**
     * @type {boolean}
     * @default false
     */
    this.local = false;
  }
}

export default TransformConstraintData;
