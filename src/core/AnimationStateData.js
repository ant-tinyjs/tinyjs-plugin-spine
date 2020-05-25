/**
 * Stores mix (crossfade) durations to be applied when {@link Tiny.spine.AnimationState} animations are changed.
 *
 * @class
 * @memberof Tiny.spine
 */
class AnimationStateData {
  /**
   *
   * @param {Tiny.spine.SkeletonData} skeletonData
   */
  constructor(skeletonData) {
    /**
     * @type {object}
     * @default {}
     */
    this.animationToMixTime = {};

    /**
     * The mix duration to use when no mix duration has been defined between two animations.
     *
     * @type {number}
     * @default 0
     */
    this.defaultMix = 0;
    if (skeletonData == null) {
      throw new Error('skeletonData cannot be null.');
    }
    /**
     * The SkeletonData to look up animations when they are specified by name.
     *
     * @type {Tiny.spine.SkeletonData}
     */
    this.skeletonData = skeletonData;
  }

  /**
   * Sets a mix duration by animation name.
   *
   * See {@link Tiny.spine.AnimationStateData#setMixWith}.
   *
   * @param {string} fromName
   * @param {string} toName
   * @param {number} duration
   */
  setMix(fromName, toName, duration) {
    const from = this.skeletonData.findAnimation(fromName);

    if (from == null) {
      throw new Error(`Animation not found: ${fromName}`);
    }

    const to = this.skeletonData.findAnimation(toName);

    if (to == null) {
      throw new Error(`Animation not found: ${toName}`);
    }
    this.setMixWith(from, to, duration);
  }

  /**
   * Sets the mix duration when changing from the specified animation to the other.
   *
   * See {@link Tiny.spine.TrackEntry#mixDuration}.
   *
   * @param {Tiny.spine.Animation} from
   * @param {Tiny.spine.Animation} to
   * @param {number} duration
   */
  setMixWith(from, to, duration) {
    if (from == null) {
      throw new Error('from cannot be null.');
    }
    if (to == null) {
      throw new Error('to cannot be null.');
    }

    const key = `${from.name}.${to.name}`;

    this.animationToMixTime[key] = duration;
  }

  /**
   * Returns the mix duration to use when changing from the specified animation to the other, or the {@link Tiny.spine.AnimationStateData#defaultMix} if
   * no mix duration has been set.
   *
   * @param {Tiny.spine.Animation} from
   * @param {Tiny.spine.Animation} to
   */
  getMix(from, to) {
    const key = `${from.name}.${to.name}`;
    const value = this.animationToMixTime[key];

    return value === undefined ? this.defaultMix : value;
  }
}

export default AnimationStateData;
