/**
 * Stores the setup pose and all of the stateless data for a skeleton.
 *
 * See [Data objects](http://esotericsoftware.com/spine-runtime-architecture#Data-objects) in the Spine Runtimes
 * Guide.
 *
 * @class
 * @memberof Tiny.spine
 */
class SkeletonData {
  /**
   *
   */
  constructor() {
    /**
     * The skeleton's name, which by default is the name of the skeleton data file, if possible. May be null.
     *
     * @name name
     * @type {string}
     * @memberof Tiny.spine.SkeletonData.prototype
     */
    /**
     * The skeleton's bones, sorted parent first. The root bone is always the first bone.
     *
     * @type {Tiny.spine.BoneData[]}
     * @default []
     */
    this.bones = [];
    /**
     * The skeleton's slots.
     *
     * @type {Tiny.spine.SlotData[]}
     * @default []
     */
    this.slots = [];
    /**
     * @type {Tiny.spine.Skin[]}
     * @default []
     */
    this.skins = [];
    /**
     * The skeleton's default skin. By default this skin contains all attachments that were not in a skin in Spine.
     *
     * @see Tiny.spine.Skeleton#getAttachmentByName
     * @name defaultSkin
     * @type {?Tiny.spine.Skin}
     * @memberof Tiny.spine.SkeletonData.prototype
     */
    /**
     * The skeleton's events.
     *
     * @type {Tiny.spine.EventData[]}
     * @default []
     */
    this.events = [];
    /**
     * The skeleton's animations.
     *
     * @type {Tiny.spine.Animation[]}
     * @default []
     */
    this.animations = [];
    /**
     * The skeleton's IK constraints.
     *
     * @type {Tiny.spine.IKConstraintData[]}
     * @default []
     */
    this.ikConstraints = [];
    /**
     * The skeleton's transform constraints.
     *
     * @type {Tiny.spine.TransformConstraintData[]}
     * @default []
     */
    this.transformConstraints = [];
    /**
     * The skeleton's path constraints.
     *
     * @type {Tiny.spine.PathConstraintData[]}
     * @default []
     */
    this.pathConstraints = [];
    /**
     * The X coordinate of the skeleton's axis aligned bounding box in the setup pose.
     *
     * @name x
     * @type {number}
     * @memberof Tiny.spine.SkeletonData.prototype
     */
    /**
     * The Y coordinate of the skeleton's axis aligned bounding box in the setup pose.
     *
     * @name y
     * @type {number}
     * @memberof Tiny.spine.SkeletonData.prototype
     */
    /**
     * The width of the skeleton's axis aligned bounding box in the setup pose.
     *
     * @name width
     * @type {number}
     * @memberof Tiny.spine.SkeletonData.prototype
     */
    /**
     * The height of the skeleton's axis aligned bounding box in the setup pose.
     *
     * @name height
     * @type {number}
     * @memberof Tiny.spine.SkeletonData.prototype
     */
    /**
     * The Spine version used to export the skeleton data, or null.
     *
     * @name version
     * @type {string}
     * @memberof Tiny.spine.SkeletonData.prototype
     */
    /**
     * The skeleton data hash. This value will change if any of the skeleton data has changed. May be null.
     *
     * @name hash
     * @type {string}
     * @memberof Tiny.spine.SkeletonData.prototype
     */
    /**
     * The dopesheet FPS in Spine. Available only when nonessential data was exported.
     *
     * @type {number}
     * @default 0
     */
    this.fps = 0;
    /**
     * The path to the images directory as defined in Spine. Available only when nonessential data was exported. May be null.
     *
     * @name imagesPath
     * @type {string}
     * @memberof Tiny.spine.SkeletonData.prototype
     */
    /**
     * The path to the audio directory as defined in Spine. Available only when nonessential data was exported. May be null.
     *
     * @name audioPath
     * @type {string}
     * @memberof Tiny.spine.SkeletonData.prototype
     */
  }
  /**
   * Finds a bone by comparing each bone's name. It is more efficient to cache the results of this method than to call it
   * multiple times.
   *
   * @param {string} boneName
   * @return {?Tiny.spine.BoneData}
   */
  findBone(boneName) {
    if (boneName == null) {
      throw new Error('boneName cannot be null.');
    }

    const bones = this.bones;

    for (let i = 0, n = bones.length; i < n; i++) {
      const bone = bones[i];

      if (bone.name === boneName) {
        return bone;
      }
    }
    return null;
  }

  /**
   *
   * @param {string} boneName
   * @return {number}
   */
  findBoneIndex(boneName) {
    if (boneName == null) {
      throw new Error('boneName cannot be null.');
    }

    const bones = this.bones;

    for (let i = 0, n = bones.length; i < n; i++) {
      if (bones[i].name === boneName) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Finds a slot by comparing each slot's name. It is more efficient to cache the results of this method than to call it
   * multiple times.
   *
   * @param {string} slotName
   * @return {?Tiny.spine.SlotData}
   */
  findSlot(slotName) {
    if (slotName == null) {
      throw new Error('slotName cannot be null.');
    }

    const slots = this.slots;

    for (let i = 0, n = slots.length; i < n; i++) {
      const slot = slots[i];

      if (slot.name === slotName) {
        return slot;
      }
    }
    return null;
  }

  /**
   *
   * @param {string} slotName
   * @return {number}
   */
  findSlotIndex(slotName) {
    if (slotName == null) {
      throw new Error('slotName cannot be null.');
    }

    const slots = this.slots;

    for (let i = 0, n = slots.length; i < n; i++) {
      if (slots[i].name === slotName) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Finds a skin by comparing each skin's name. It is more efficient to cache the results of this method than to call it
   * multiple times.
   *
   * @param {string} skinName
   * @return {?Tiny.spine.Skin}
   */
  findSkin(skinName) {
    if (skinName == null) {
      throw new Error('skinName cannot be null.');
    }

    const skins = this.skins;

    for (let i = 0, n = skins.length; i < n; i++) {
      const skin = skins[i];

      if (skin.name === skinName) {
        return skin;
      }
    }
    return null;
  }

  /**
   * Finds an event by comparing each events's name. It is more efficient to cache the results of this method than to call it
   * multiple times.
   *
   * @param {string} eventDataName
   * @return {?Tiny.spine.EventData}
   */
  findEvent(eventDataName) {
    if (eventDataName == null) {
      throw new Error('eventDataName cannot be null.');
    }

    const events = this.events;

    for (let i = 0, n = events.length; i < n; i++) {
      const event = events[i];

      if (event.name === eventDataName) {
        return event;
      }
    }
    return null;
  }

  /**
   * Finds an animation by comparing each animation's name. It is more efficient to cache the results of this method than to
   * call it multiple times.
   *
   * @param {string} animationName
   * @return {?Tiny.spine.Animation}
   */
  findAnimation(animationName) {
    if (animationName == null) {
      throw new Error('animationName cannot be null.');
    }

    const animations = this.animations;

    for (let i = 0, n = animations.length; i < n; i++) {
      const animation = animations[i];

      if (animation.name === animationName) {
        return animation;
      }
    }
    return null;
  }

  /**
   * Finds an IK constraint by comparing each IK constraint's name. It is more efficient to cache the results of this method
   * than to call it multiple times.
   *
   * @param {string} constraintName
   * @return {?Tiny.spine.IKConstraintData}
   */
  findIKConstraint(constraintName) {
    if (constraintName == null) {
      throw new Error('constraintName cannot be null.');
    }

    const ikConstraints = this.ikConstraints;

    for (let i = 0, n = ikConstraints.length; i < n; i++) {
      const constraint = ikConstraints[i];

      if (constraint.name === constraintName) {
        return constraint;
      }
    }
    return null;
  }

  /**
   * Finds a transform constraint by comparing each transform constraint's name. It is more efficient to cache the results of
   * this method than to call it multiple times.
   *
   * @param {string} constraintName
   * @return {?Tiny.spine.TransformConstraintData}
   */
  findTransformConstraint(constraintName) {
    if (constraintName == null) {
      throw new Error('constraintName cannot be null.');
    }

    const transformConstraints = this.transformConstraints;

    for (let i = 0, n = transformConstraints.length; i < n; i++) {
      const constraint = transformConstraints[i];

      if (constraint.name === constraintName) {
        return constraint;
      }
    }
    return null;
  }

  /**
   * inds a path constraint by comparing each path constraint's name. It is more efficient to cache the results of this method
   * than to call it multiple times.
   *
   * @param {string} constraintName
   * @return {?Tiny.spine.PathConstraintData}
   */
  findPathConstraint(constraintName) {
    if (constraintName == null) {
      throw new Error('constraintName cannot be null.');
    }

    const pathConstraints = this.pathConstraints;

    for (let i = 0, n = pathConstraints.length; i < n; i++) {
      const constraint = pathConstraints[i];

      if (constraint.name === constraintName) {
        return constraint;
      }
    }
    return null;
  }

  /**
   *
   * @param {string} pathConstraintName
   * @return {number}
   */
  findPathConstraintIndex(pathConstraintName) {
    if (pathConstraintName == null) {
      throw new Error('pathConstraintName cannot be null.');
    }

    const pathConstraints = this.pathConstraints;

    for (let i = 0, n = pathConstraints.length; i < n; i++) {
      if (pathConstraints[i].name === pathConstraintName) {
        return i;
      }
    }
    return -1;
  }
}

export default SkeletonData;
