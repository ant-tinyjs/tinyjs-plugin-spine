import { radDeg, PI } from './utils';
import { TransformMode } from './BoneData';

/**
 * Stores the current pose for an IK constraint. An IK constraint adjusts the rotation of 1 or 2 constrained bones so the tip of
 * the last bone is as close to the target bone as possible.
 *
 * See [IK constraints](http://esotericsoftware.com/spine-ik-constraints) in the Spine User Guide.
 *
 * @class
 * @memberof Tiny.spine
 * @implements {Tiny.spine.Updatable}
 */
class IKConstraint {
  /**
   *
   * @param {Tiny.spine.IKConstraintData} data
   * @param {Tiny.spine.Skeleton} skeleton
   */
  constructor(data, skeleton) {
    /**
     * Controls the bend direction of the IK bones, either 1 or -1.
     *
     * @type {number}
     * @default 0
     */
    this.bendDirection = 0;
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
    /**
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
     * The IK constraint's setup pose data.
     *
     * @type {Tiny.spine.IKConstraintData}
     */
    this.data = data;
    this.mix = data.mix;
    this.softness = data.softness;
    this.bendDirection = data.bendDirection;
    this.compress = data.compress;
    this.stretch = data.stretch;

    /**
     * The bones that will be modified by this IK constraint.
     *
     * @type {Tiny.spine.Bone[]}
     */
    this.bones = [];

    for (let i = 0; i < data.bones.length; i++) {
      this.bones.push(skeleton.findBone(data.bones[i].name));
    }

    /**
     * The bone that is the IK target.
     *
     * @type {Tiny.spine.Bone}
     */
    this.target = skeleton.findBone(data.target.name);
  }

  /**
   * @return {boolean}
   */
  isActive() {
    return this.active;
  }

  /**
   * Applies the constraint to the constrained bones.
   */
  apply() {
    this.update();
  }

  /**
   *
   */
  update() {
    const target = this.target;
    const bones = this.bones;

    switch (bones.length) {
      case 1:
        this.apply1(bones[0], target.worldX, target.worldY, this.compress, this.stretch, this.data.uniform, this.mix);
        break;
      case 2:
        this.apply2(bones[0], bones[1], target.worldX, target.worldY, this.bendDirection, this.stretch, this.softness, this.mix);
        break;
    }
  }

  /**
   * Applies 1 bone IK. The target is specified in the world coordinate system.
   *
   * @param {Tiny.spine.Bone} bone
   * @param {number} targetX
   * @param {number} targetY
   * @param {boolean} compress
   * @param {boolean} stretch
   * @param {boolean} uniform
   * @param {number} alpha
   */
  apply1(bone, targetX, targetY, compress, stretch, uniform, alpha) {
    if (!bone.appliedValid) {
      bone.updateAppliedTransform();
    }

    const p = bone.parent.matrix;
    let pa = p.a;
    let pb = p.c;
    let pc = p.b;
    let pd = p.d;
    let rotationIK = -bone.ashearX - bone.arotation;
    let tx = 0;
    let ty = 0;

    switch (bone.data.transformMode) {
      case TransformMode.OnlyTranslation:
        tx = targetX - bone.worldX;
        ty = targetY - bone.worldY;
        break;
      case TransformMode.NoRotationOrReflection:
        rotationIK += Math.atan2(pc, pa) * radDeg;

        const ps = Math.abs(pa * pd - pb * pc) / (pa * pa + pc * pc);

        pb = -pc * ps;
        pd = pa * ps;
        // Fall through
      default:
        const x = targetX - p.tx;
        const y = targetY - p.ty;
        const d = pa * pd - pb * pc;

        tx = (x * pd - y * pb) / d - bone.ax;
        ty = (y * pa - x * pc) / d - bone.ay;
    }
    rotationIK += Math.atan2(ty, tx) * radDeg;

    if (bone.ascaleX < 0) {
      rotationIK += 180;
    }
    if (rotationIK > 180) {
      rotationIK -= 360;
    } else if (rotationIK < -180) {
      rotationIK += 360;
    }

    let sx = bone.ascaleX;
    let sy = bone.ascaleY;

    if (compress || stretch) {
      switch (bone.data.transformMode) {
        case TransformMode.NoScale:
        case TransformMode.NoScaleOrReflection:
          tx = targetX - bone.worldX;
          ty = targetY - bone.worldY;
      }

      const b = bone.data.length * sx;
      const dd = Math.sqrt(tx * tx + ty * ty);

      // eslint-disable-next-line no-mixed-operators
      if ((compress && dd < b) || (stretch && dd > b) && b > 0.0001) {
        const s = (dd / b - 1) * alpha + 1;

        sx *= s;
        if (uniform) {
          sy *= s;
        }
      }
    }
    bone.updateWorldTransformWith(bone.ax, bone.ay, bone.arotation + rotationIK * alpha, sx, sy, bone.ashearX, bone.ashearY);
  }

  /**
   * Applies 2 bone IK. The target is specified in the world coordinate system.
   *
   * @param {Tiny.spine.Bone} parent
   * @param {Tiny.spine.Bone} child - A direct descendant of the parent bone.
   * @param {number} targetX
   * @param {number} targetY
   * @param {number} bendDir
   * @param {boolean} stretch
   * @param {number} softness
   * @param {number} alpha
   */
  apply2(parent, child, targetX, targetY, bendDir, stretch, softness, alpha) {
    if (alpha === 0) {
      child.updateWorldTransform();
      return;
    }
    if (!parent.appliedValid) {
      parent.updateAppliedTransform();
    }
    if (!child.appliedValid) {
      child.updateAppliedTransform();
    }

    const px = parent.ax;
    const py = parent.ay;
    let psx = parent.ascaleX;
    let sx = psx;
    let psy = parent.ascaleY;
    let csx = child.ascaleX;
    const pmat = parent.matrix;
    let os1 = 0;
    let os2 = 0;
    let s2 = 0;

    if (psx < 0) {
      psx = -psx;
      os1 = 180;
      s2 = -1;
    } else {
      os1 = 0;
      s2 = 1;
    }
    if (psy < 0) {
      psy = -psy;
      s2 = -s2;
    }
    if (csx < 0) {
      csx = -csx;
      os2 = 180;
    } else {
      os2 = 0;
    }

    let cx = child.ax;
    let cy = 0;
    let cwx = 0;
    let cwy = 0;
    let a = pmat.a;
    let b = pmat.c;
    let c = pmat.b;
    let d = pmat.d;
    const u = Math.abs(psx - psy) <= 0.0001;

    if (!u) {
      cy = 0;
      cwx = a * cx + pmat.tx;
      cwy = c * cx + pmat.ty;
    } else {
      cy = child.ay;
      cwx = a * cx + b * cy + pmat.tx;
      cwy = c * cx + d * cy + pmat.ty;
    }

    let pp = parent.parent.matrix;

    a = pp.a;
    b = pp.c;
    c = pp.b;
    d = pp.d;

    const id = 1 / (a * d - b * c);
    let x = cwx - pp.tx;
    let y = cwy - pp.ty;
    const dx = (x * d - y * b) * id - px;
    const dy = (y * a - x * c) * id - py;
    let l1 = Math.sqrt(dx * dx + dy * dy);
    let l2 = child.data.length * csx;
    let a1;
    let a2;

    if (l1 < 0.0001) {
      this.apply1(parent, targetX, targetY, false, stretch, false, alpha);
      child.updateWorldTransformWith(cx, cy, 0, child.ascaleX, child.ascaleY, child.ashearX, child.ashearY);
      return;
    }
    x = targetX - pp.tx;
    y = targetY - pp.ty;

    let tx = (x * d - y * b) * id - px;
    let ty = (y * a - x * c) * id - py;
    let dd = tx * tx + ty * ty;

    if (softness !== 0) {
      softness *= psx * (csx + 1) / 2;

      const td = Math.sqrt(dd);
      const sd = td - l1 - l2 * psx + softness;

      if (sd > 0) {
        let p = Math.min(1, sd / (softness * 2)) - 1;

        p = (sd - softness * (1 - p * p)) / td;
        tx -= p * tx;
        ty -= p * ty;
        dd = tx * tx + ty * ty;
      }
    }
    // eslint-disable-next-line no-labels
    outer: if (u) {
      l2 *= psx;

      let cos = (dd - l1 * l1 - l2 * l2) / (2 * l1 * l2);

      if (cos < -1) {
        cos = -1;
      } else if (cos > 1) {
        cos = 1;
        if (stretch) {
          sx *= (Math.sqrt(dd) / (l1 + l2) - 1) * alpha + 1;
        }
      }
      a2 = Math.acos(cos) * bendDir;
      a = l1 + l2 * cos;
      b = l2 * Math.sin(a2);
      a1 = Math.atan2(ty * a - tx * b, tx * a + ty * b);
    } else {
      a = psx * l2;
      b = psy * l2;

      let aa = a * a;
      let bb = b * b;
      let ta = Math.atan2(ty, tx);

      c = bb * l1 * l1 + aa * dd - aa * bb;

      const c1 = -2 * bb * l1;
      const c2 = bb - aa;

      d = c1 * c1 - 4 * c2 * c;
      if (d >= 0) {
        let q = Math.sqrt(d);

        if (c1 < 0) {
          q = -q;
        }

        q = -(c1 + q) / 2;

        const r0 = q / c2;
        const r1 = c / q;
        const r = Math.abs(r0) < Math.abs(r1) ? r0 : r1;

        if (r * r <= dd) {
          y = Math.sqrt(dd - r * r) * bendDir;
          a1 = ta - Math.atan2(y, r);
          a2 = Math.atan2(y / psy, (r - l1) / psx);
          // eslint-disable-next-line no-labels
          break outer;
        }
      }
      let minAngle = PI;
      let minX = l1 - a;
      let minDist = minX * minX;
      let minY = 0;
      let maxAngle = 0;
      let maxX = l1 + a;
      let maxDist = maxX * maxX;
      let maxY = 0;

      c = -a * l1 / (aa - bb);
      if (c >= -1 && c <= 1) {
        c = Math.acos(c);
        x = a * Math.cos(c) + l1;
        y = b * Math.sin(c);
        d = x * x + y * y;
        if (d < minDist) {
          minAngle = c;
          minDist = d;
          minX = x;
          minY = y;
        }
        if (d > maxDist) {
          maxAngle = c;
          maxDist = d;
          maxX = x;
          maxY = y;
        }
      }
      if (dd <= (minDist + maxDist) / 2) {
        a1 = ta - Math.atan2(minY * bendDir, minX);
        a2 = minAngle * bendDir;
      } else {
        a1 = ta - Math.atan2(maxY * bendDir, maxX);
        a2 = maxAngle * bendDir;
      }
    }

    const os = Math.atan2(cy, cx) * s2;
    let rotation = parent.arotation;

    a1 = (a1 - os) * radDeg + os1 - rotation;
    if (a1 > 180) {
      a1 -= 360;
    } else if (a1 < -180) {
      a1 += 360;
    }
    parent.updateWorldTransformWith(px, py, rotation + a1 * alpha, sx, parent.ascaleY, 0, 0);
    rotation = child.arotation;
    a2 = ((a2 + os) * radDeg - child.ashearX) * s2 + os2 - rotation;
    if (a2 > 180) {
      a2 -= 360;
    } else if (a2 < -180) {
      a2 += 360;
    }
    child.updateWorldTransformWith(cx, cy, rotation + a2 * alpha, child.ascaleX, child.ascaleY, child.ashearX, child.ashearY);
  }
}

export default IKConstraint;
