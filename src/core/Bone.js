import { cosDeg, sinDeg, radDeg } from './utils';
import { TransformMode } from './BoneData';

/**
 * The interface for items updated by {@link Tiny.spine.Skeleton#updateWorldTransform}.
 *
 * @name Updatable
 * @memberof Tiny.spine
 * @interface
 */
/**
 * @function
 * @name Tiny.spine.Updatable#update
 */
/**
 * Returns false when this item has not been updated because a skin is required and the {@link Tiny.spine.Skeleton#skin} active skin
 * does not contain this item.
 *
 * @see Tiny.spine.Skin#bones
 * @see Tiny.spine.Skin#constraints
 * @function
 * @name Tiny.spine.Updatable#isActive
 * @return {boolean}
 */

/**
 * Stores a bone's current pose.
 *
 * A bone has a local transform which is used to compute its world transform. A bone also has an applied transform, which is a
 * local transform that can be applied to compute the world transform. The local transform and applied transform may differ if a
 * constraint or application code modifies the world transform after it was computed from the local transform.
 *
 * @class
 * @memberof Tiny.spine
 * @implements {Tiny.spine.Updatable}
 */
class Bone {
  /**
   *
   * @param {Tiny.spine.BoneData} data
   * @param {Tiny.spine.Skeleton} skeleton
   * @param {?Tiny.spine.Bone} parent
   */
  constructor(data, skeleton, parent) {
    /**
     * Be careful! Spine b,c is c,b in TinyJS matrix
     */
    this.matrix = new Tiny.Matrix();
    /**
     * The immediate children of this bone.
     *
     * @type {Tiny.spine.Bone[]}
     * @default []
     */
    this.children = [];
    /**
     * The local x translation.
     *
     * @type {number}
     * @default 0
     */
    this.x = 0;
    /**
     * The local y translation.
     *
     * @type {number}
     * @default 0
     */
    this.y = 0;
    /**
     * The local rotation in degrees, counter clockwise.
     *
     * @type {number}
     * @default 0
     */
    this.rotation = 0;
    /**
     * The local scaleX.
     *
     * @type {number}
     * @default 0
     */
    this.scaleX = 0;
    /**
     * The local scaleY.
     *
     * @type {number}
     * @default 0
     */
    this.scaleY = 0;
    /**
     * The local shearX.
     *
     * @type {number}
     * @default 0
     */
    this.shearX = 0;
    /**
     * The local shearY.
     *
     * @type {number}
     * @default 0
     */
    this.shearY = 0;
    /**
     * The applied local x translation.
     *
     * @type {number}
     * @default 0
     */
    this.ax = 0;
    /**
     * The applied local y translation.
     *
     * @type {number}
     * @default 0
     */
    this.ay = 0;
    /**
     * The applied local rotation in degrees, counter clockwise.
     *
     * @type {number}
     * @default 0
     */
    this.arotation = 0;
    /**
     * The applied local scaleX.
     *
     * @type {number}
     * @default 0
     */
    this.ascaleX = 0;
    /**
     * The applied local scaleY.
     *
     * @type {number}
     * @default 0
     */
    this.ascaleY = 0;
    /**
     * The applied local ashearX.
     *
     * @type {number}
     * @default 0
     */
    this.ashearX = 0;
    /**
     * The applied local ashearY.
     *
     * @type {number}
     * @default 0
     */
    this.ashearY = 0;
    /**
     * If true, the applied transform matches the world transform. If false, the world transform has been modified since it was
     * computed and {@link Tiny.spine.Bone#updateAppliedTransform} must be called before accessing the applied transform.
     *
     * @type {boolean}
     * @default false
     */
    this.appliedValid = false;
    /**
     *
     * @type {boolean}
     * @default false
     */
    this.sorted = false;
    /**
     *
     * @type {boolean}
     * @default false
     */
    this.active = false;

    if (data == null) {
      throw new Error('data cannot be null.');
    }
    if (skeleton == null) {
      throw new Error('skeleton cannot be null.');
    }
    /**
     * The bone's setup pose data.
     *
     * @type {Tiny.spine.BoneData}
     */
    this.data = data;
    /**
     * The skeleton this bone belongs to.
     *
     * @type {Tiny.spine.Skeleton}
     */
    this.skeleton = skeleton;
    /**
     * The parent bone, or null if this is the root bone.
     *
     * @type {Tiny.spine.Bone}
     */
    this.parent = parent;
    this.setToSetupPose();
  }

  /**
   * Returns false when the bone has not been computed because {@link Tiny.spine.BoneData#skinRequired} is true and the
   * {@link Tiny.spine.Skeleton#skin} active skin does not {@link Tiny.spine.Skin#bones} contain this bone.
   *
   * @return {boolean}
   */
  isActive() {
    return this.active;
  }

  /**
   * Same as {@link Tiny.spine.Bone#updateWorldTransform}. This method exists for Bone to implement {@link Tiny.spine.Updatable}.
   */
  update() {
    this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
  }

  /**
   * Computes the world transform using the parent bone and this bone's local transform.
   *
   * @see Tiny.spine.Bone#updateWorldTransformWith
   */
  updateWorldTransform() {
    this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
  }
  /**
   *
   * Computes the world transform using the parent bone and the specified local transform. Child bones are not updated.
   *
   * See [World transforms](http://esotericsoftware.com/spine-runtime-skeletons#World-transforms) in the Spine
   * Runtimes Guide.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} rotation
   * @param {number} scaleX
   * @param {number} scaleY
   * @param {number} shearX
   * @param {number} shearY
   */
  updateWorldTransformWith(x, y, rotation, scaleX, scaleY, shearX, shearY) {
    this.ax = x;
    this.ay = y;
    this.arotation = rotation;
    this.ascaleX = scaleX;
    this.ascaleY = scaleY;
    this.ashearX = shearX;
    this.ashearY = shearY;
    this.appliedValid = true;

    const parent = this.parent;
    const m = this.matrix;

    const sx = this.skeleton.scaleX;
    const sy = Bone.yDown ? -this.skeleton.scaleY : this.skeleton.scaleY;

    if (parent == null) { // Root bone.
      const skeleton = this.skeleton;
      const rotationY = rotation + 90 + shearY;

      m.a = cosDeg(rotation + shearX) * scaleX * sx;
      m.c = cosDeg(rotationY) * scaleY * sx;
      m.b = sinDeg(rotation + shearX) * scaleX * sy;
      m.d = sinDeg(rotationY) * scaleY * sy;
      m.tx = x * sx + skeleton.x;
      m.ty = y * sy + skeleton.y;
      return;
    }

    let pa = parent.matrix.a;
    let pb = parent.matrix.c;
    let pc = parent.matrix.b;
    let pd = parent.matrix.d;

    m.tx = pa * x + pb * y + parent.matrix.tx;
    m.ty = pc * x + pd * y + parent.matrix.ty;

    switch (this.data.transformMode) {
      case TransformMode.Normal: {
        const rotationY = rotation + 90 + shearY;
        const la = cosDeg(rotation + shearX) * scaleX;
        const lb = cosDeg(rotationY) * scaleY;
        const lc = sinDeg(rotation + shearX) * scaleX;
        const ld = sinDeg(rotationY) * scaleY;

        m.a = pa * la + pb * lc;
        m.c = pa * lb + pb * ld;
        m.b = pc * la + pd * lc;
        m.d = pc * lb + pd * ld;
        return;
      }
      case TransformMode.OnlyTranslation: {
        const rotationY = rotation + 90 + shearY;

        m.a = cosDeg(rotation + shearX) * scaleX;
        m.c = cosDeg(rotationY) * scaleY;
        m.b = sinDeg(rotation + shearX) * scaleX;
        m.d = sinDeg(rotationY) * scaleY;
        break;
      }
      case TransformMode.NoRotationOrReflection: {
        let s = pa * pa + pc * pc;
        let prx = 0;

        if (s > 0.0001) {
          s = Math.abs(pa * pd - pb * pc) / s;
          pb = pc * s;
          pd = pa * s;
          prx = Math.atan2(pc, pa) * radDeg;
        } else {
          pa = 0;
          pc = 0;
          prx = 90 - Math.atan2(pd, pb) * radDeg;
        }

        const rx = rotation + shearX - prx;
        const ry = rotation + shearY - prx + 90;
        const la = cosDeg(rx) * scaleX;
        const lb = cosDeg(ry) * scaleY;
        const lc = sinDeg(rx) * scaleX;
        const ld = sinDeg(ry) * scaleY;

        m.a = pa * la - pb * lc;
        m.c = pa * lb - pb * ld;
        m.b = pc * la + pd * lc;
        m.d = pc * lb + pd * ld;
        break;
      }
      case TransformMode.NoScale:
      case TransformMode.NoScaleOrReflection: {
        const cos = cosDeg(rotation);
        const sin = sinDeg(rotation);
        let za = (pa * cos + pb * sin) / sx;
        let zc = (pc * cos + pd * sin) / sy;
        let s = Math.sqrt(za * za + zc * zc);

        if (s > 0.00001) {
          s = 1 / s;
        }
        za *= s;
        zc *= s;
        s = Math.sqrt(za * za + zc * zc);
        if (
          this.data.transformMode === TransformMode.NoScale &&
          (pa * pd - pb * pc < 0) !== (Bone.yDown ? ((this.skeleton.scaleX < 0) !== (this.skeleton.scaleY > 0)) : ((this.skeleton.scaleX < 0) !== (this.skeleton.scaleY < 0)))
        ) {
          s = -s;
        }

        const r = Math.PI / 2 + Math.atan2(zc, za);
        const zb = Math.cos(r) * s;
        const zd = Math.sin(r) * s;
        const la = cosDeg(shearX) * scaleX;
        const lb = cosDeg(90 + shearY) * scaleY;
        const lc = sinDeg(shearX) * scaleX;
        const ld = sinDeg(90 + shearY) * scaleY;

        m.a = za * la + zb * lc;
        m.c = za * lb + zb * ld;
        m.b = zc * la + zd * lc;
        m.d = zc * lb + zd * ld;
        break;
      }
    }
    m.a *= sx;
    m.c *= sx;
    m.b *= sy;
    m.d *= sy;
  }

  /**
   * Sets this bone's local transform to the setup pose.
   */
  setToSetupPose() {
    const data = this.data;

    this.x = data.x;
    this.y = data.y;
    this.rotation = data.rotation;
    this.scaleX = data.scaleX;
    this.scaleY = data.scaleY;
    this.shearX = data.shearX;
    this.shearY = data.shearY;
  }

  /**
   * The world rotation for the X axis, calculated using {@link Tiny.spine.Bone#a} and {@link Tiny.spine.Bone#c}.
   *
   * @return {number}
   */
  getWorldRotationX() {
    return Math.atan2(this.matrix.b, this.matrix.a) * radDeg;
  }

  /**
   * The world rotation for the Y axis, calculated using {@link Tiny.spine.Bone#b} and {@link Tiny.spine.Bone#d}.
   *
   * @return {number}
   */
  getWorldRotationY() {
    return Math.atan2(this.matrix.d, this.matrix.c) * radDeg;
  }

  /**
   * The magnitude (always positive) of the world scale X, calculated using {@link Tiny.spine.Bone#a} and {@link Tiny.spine.Bone#c}.
   *
   * @return {number}
   */
  getWorldScaleX() {
    const m = this.matrix;

    return Math.sqrt(m.a * m.a + m.c * m.c);
  }

  /**
   * The magnitude (always positive) of the world scale Y, calculated using {@link Tiny.spine.Bone#b} and {@link Tiny.spine.Bone#d}.
   *
   * @return {number}
   */
  getWorldScaleY() {
    const m = this.matrix;

    return Math.sqrt(m.b * m.b + m.d * m.d);
  }

  /**
   * Computes the individual applied transform values from the world transform. This can be useful to perform processing using
   * the applied transform after the world transform has been modified directly (eg, by a constraint).
   * <p>
   * Some information is ambiguous in the world transform, such as -1,-1 scale versus 180 rotation.
   */
  updateAppliedTransform() {
    this.appliedValid = true;

    const parent = this.parent;
    const m = this.matrix;

    if (parent == null) {
      this.ax = m.tx;
      this.ay = m.ty;
      this.arotation = Math.atan2(m.b, m.a) * radDeg;
      this.ascaleX = Math.sqrt(m.a * m.a + m.b * m.b);
      this.ascaleY = Math.sqrt(m.c * m.c + m.d * m.d);
      this.ashearX = 0;
      this.ashearY = Math.atan2(m.a * m.c + m.b * m.d, m.a * m.d - m.b * m.c) * radDeg;
      return;
    }

    const pm = parent.matrix;
    const pid = 1 / (pm.a * pm.d - pm.b * pm.c);
    const dx = m.tx - pm.tx;
    const dy = m.ty - pm.ty;

    this.ax = (dx * pm.d * pid - dy * pm.c * pid);
    this.ay = (dy * pm.a * pid - dx * pm.b * pid);

    const ia = pid * pm.d;
    const id = pid * pm.a;
    const ib = pid * pm.c;
    const ic = pid * pm.b;
    const ra = ia * m.a - ib * m.b;
    const rb = ia * m.c - ib * m.d;
    const rc = id * m.b - ic * m.a;
    const rd = id * m.d - ic * m.c;

    this.ashearX = 0;
    this.ascaleX = Math.sqrt(ra * ra + rc * rc);
    if (this.ascaleX > 0.0001) {
      const det = ra * rd - rb * rc;

      this.ascaleY = det / this.ascaleX;
      this.ashearY = Math.atan2(ra * rb + rc * rd, det) * radDeg;
      this.arotation = Math.atan2(rc, ra) * radDeg;
    } else {
      this.ascaleX = 0;
      this.ascaleY = Math.sqrt(rb * rb + rd * rd);
      this.ashearY = 0;
      this.arotation = 90 - Math.atan2(rd, rb) * radDeg;
    }
  }

  /**
   * Transforms a point from world coordinates to the bone's local coordinates.
   *
   * @param {Tiny.spine.Vector2} world
   * @return {Tiny.spine.Vector2}
   */
  worldToLocal(world) {
    const m = this.matrix;
    const a = m.a;
    const b = m.c;
    const c = m.b;
    const d = m.d;
    const invDet = 1 / (a * d - b * c);
    const x = world.x - m.tx;
    const y = world.y - m.ty;

    world.x = (x * d * invDet - y * b * invDet);
    world.y = (y * a * invDet - x * c * invDet);
    return world;
  }

  /**
   * Transforms a point from the bone's local coordinates to world coordinates.
   *
   * @param {Tiny.spine.Vector2} local
   * @return {Tiny.spine.Vector2}
   */
  localToWorld(local) {
    const m = this.matrix;
    const x = local.x;
    const y = local.y;

    local.x = x * m.a + y * m.c + m.tx;
    local.y = x * m.b + y * m.d + m.ty;
    return local;
  }

  /**
   * Transforms a world rotation to a local rotation.
   *
   * @param {number} worldRotation
   * @return {number}
   */
  worldToLocalRotation(worldRotation) {
    const sin = sinDeg(worldRotation);
    const cos = cosDeg(worldRotation);
    const mat = this.matrix;

    return Math.atan2(mat.a * sin - mat.b * cos, mat.d * cos - mat.c * sin) * radDeg + this.rotation - this.shearX;
  }

  /**
   * Transforms a local rotation to a world rotation.
   *
   * @param {number} localRotation
   * @return {number}
   */
  localToWorldRotation(localRotation) {
    const sin = sinDeg(localRotation);
    const cos = cosDeg(localRotation);
    const mat = this.matrix;

    return Math.atan2(cos * mat.b + sin * mat.d, cos * mat.a + sin * mat.c) * radDeg;
  }

  /**
   * Rotates the world transform the specified amount and sets {@link Tiny.spine.Bone#appliedValid} to false.
   * {@link Tiny.spine.Bone#updateWorldTransform} will need to be called on any child bones, recursively, and any constraints reapplied.
   *
   * @param {number} degrees
   * @return {number}
   */
  rotateWorld(degrees) {
    const mat = this.matrix;
    const a = mat.a;
    const b = mat.c;
    const c = mat.b;
    const d = mat.d;
    const cos = cosDeg(degrees);
    const sin = sinDeg(degrees);

    mat.a = cos * a - sin * c;
    mat.c = cos * b - sin * d;
    mat.b = sin * a + cos * c;
    mat.d = sin * b + cos * d;
    this.appliedValid = false;
  }

  /**
   * @readonly
   * @type {number}
   */
  get worldX() {
    return this.matrix.tx;
  }

  /**
   * @readonly
   * @type {number}
   */
  get worldY() {
    return this.matrix.ty;
  }
}

/**
 * @static
 * @type {boolean}
 */
Bone.yDown = false;

export default Bone;
