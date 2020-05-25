import ConstraintData from './ConstraintData';

/**
 * Stores the setup pose for a {@link Tiny.spine.PathConstraint}.
 *
 * See [Path constraints](http://esotericsoftware.com/spine-path-constraints) in the Spine User Guide.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.ConstraintData
 */
class PathConstraintData extends ConstraintData {
  /**
   *
   * @param {string} name
   */
  constructor(name) {
    super(name, 0, false);
    /**
     * The slot whose path attachment will be used to constrained the bones.
     *
     * @name target
     * @type {Tiny.spine.SlotData}
     * @memberof Tiny.spine.PathConstraintData.prototype
     */
    /**
     * The mode for positioning the first bone on the path.
     *
     * @name positionMode
     * @type {Tiny.spine.PositionMode}
     * @memberof Tiny.spine.PathConstraintData.prototype
     */
    /**
     * The mode for positioning the bones after the first bone on the path.
     *
     * @name spacingMode
     * @type {Tiny.spine.SpacingMode}
     * @memberof Tiny.spine.PathConstraintData.prototype
     */
    /**
     * The mode for adjusting the rotation of the bones.
     *
     * @name rotateMode
     * @type {Tiny.spine.RotateMode}
     * @memberof Tiny.spine.PathConstraintData.prototype
     */
    /**
     * An offset added to the constrained bone rotation.
     *
     * @name offsetRotation
     * @type {number}
     * @memberof Tiny.spine.PathConstraintData.prototype
     */
    /**
     * The position along the path.
     *
     * @name position
     * @type {number}
     * @memberof Tiny.spine.PathConstraintData.prototype
     */
    /**
     * The spacing between bones.
     *
     * @name spacing
     * @type {number}
     * @memberof Tiny.spine.PathConstraintData.prototype
     */
    /**
     * A percentage (0-1) that controls the mix between the constrained and unconstrained rotations.
     *
     * @name rotateMix
     * @type {number}
     * @memberof Tiny.spine.PathConstraintData.prototype
     */
    /**
     * A percentage (0-1) that controls the mix between the constrained and unconstrained translations.
     *
     * @name translateMix
     * @type {number}
     * @memberof Tiny.spine.PathConstraintData.prototype
     */

    /**
     * The bones that will be modified by this path constraint.
     *
     * @type {Tiny.spine.BoneData[]}
     */
    this.bones = [];
  }
}

/**
 * Controls how the first bone is positioned along the path.
 *
 * See [Position mode](http://esotericsoftware.com/spine-path-constraints#Position-mode) in the Spine User Guide.
 *
 * @readonly
 * @enum {number}
 * @memberof Tiny.spine
 */
const PositionMode = {
  Fixed: 0,
  Percent: 1,
};

/**
 * Controls how bones after the first bone are positioned along the path.
 *
 * [Spacing mode](http://esotericsoftware.com/spine-path-constraints#Spacing-mode) in the Spine User Guide.
 *
 * @readonly
 * @enum {number}
 * @memberof Tiny.spine
 */
const SpacingMode = {
  Length: 0,
  Fixed: 1,
  Percent: 2,
};

/**
 * Controls how bones are rotated, translated, and scaled to match the path.
 *
 * [Rotate mode](http://esotericsoftware.com/spine-path-constraints#Rotate-mod) in the Spine User Guide.
 *
 * @readonly
 * @enum {number}
 * @memberof Tiny.spine
 */
const RotateMode = {
  Tangent: 0,
  Chain: 1,
  ChainScale: 2,
};

export {
  PathConstraintData,
  PositionMode,
  SpacingMode,
  RotateMode,
};
