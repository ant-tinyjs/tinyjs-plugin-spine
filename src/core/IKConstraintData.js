import ConstraintData from './ConstraintData';

/**
 * Stores the setup pose for an {@link Tiny.spine.IKConstraint}.
 *
 * See [IK constraints](http://esotericsoftware.com/spine-ik-constraints) in the Spine User Guide.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.ConstraintData
 */
class IKConstraintData extends ConstraintData {
  /**
   *
   * @param {string} name
   */
  constructor(name) {
    super(name, 0, false);

    /**
     * The bones that are constrained by this IK constraint.
     *
     * @type {Tiny.spine.BoneData[]}
     */
    this.bones = [];
    /**
     * The bone that is the IK target.
     *
     * @name target
     * @memberof Tiny.spine.IKConstraintData.prototype
     * @type {Tiny.spine.BoneData}
     */
    /**
     * Controls the bend direction of the IK bones, either 1 or -1.
     *
     * @type {number}
     * @default 1
     */
    this.bendDirection = 1;
    /**
     * When true and only a single bone is being constrained, if the target is too close, the bone is scaled to reach it.
     *
     * @type {boolean}
     * @default false
     */
    this.compress = false;
    /**
     * When true, if the target is out of range, the parent bone is scaled to reach it. If more than one bone is being constrained
     * and the parent bone has local nonuniform scale, stretch is not applied.
     *
     * @type {boolean}
     * @default false
     */
    this.stretch = false;
    /**
     * When true, only a single bone is being constrained, and {@link #getCompress()} or {@link #getStretch()} is used, the bone
     * is scaled on both the X and Y axes.
     *
     * @type {boolean}
     * @default false
     */
    this.uniform = false;
    /**
     * A percentage (0-1) that controls the mix between the constrained and unconstrained rotations.
     *
     * @type {number}
     * @default 1
     */
    this.mix = 1;
    /**
     * For two bone IK, the distance from the maximum reach of the bones that rotation will slow.
     *
     * @type {number}
     * @default 0
     */
    this.softness = 0;
  }
}

export default IKConstraintData;
