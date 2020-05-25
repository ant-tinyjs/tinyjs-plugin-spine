/* eslint-disable no-useless-constructor */
import { newFloatArray, setArraySize, arrayCopy, clamp, signum } from './utils';
import { VertexAttachment } from './attachments/Attachment';

/**
 * Controls how a timeline value is mixed with the setup pose value or current pose value when a timeline's `alpha`
 * < 1.
 *
 * See Timeline {@link Tiny.spine.Timeline#apply}.
 *
 * @readonly
 * @enum {number}
 * @memberof Tiny.spine
 */
const MixBlend = {
  /**
   * Transitions from the setup value to the timeline value (the current value is not used). Before the first key, the setup
   * value is set.
   */
  setup: 0,
  /**
   * Transitions from the current value to the timeline value. Before the first key, transitions from the current value to
   * the setup value. Timelines which perform instant transitions, such as {@link Tiny.spine.DrawOrderTimeline} or
   * {@link Tiny.spine.AttachmentTimeline}, use the setup value before the first key.
   *
   * `first` is intended for the first animations applied, not for animations layered on top of those.
   */
  first: 1,
  /**
   * Transitions from the current value to the timeline value. No change is made before the first key (the current value is
   * kept until the first key).
   *
   * `replace` is intended for animations layered on top of others, not for the first animations applied.
   */
  replace: 2,
  /**
   * Transitions from the current value to the current value plus the timeline value. No change is made before the first key
   * (the current value is kept until the first key).
   *
   * `add` is intended for animations layered on top of others, not for the first animations applied. Properties
   * keyed by additive animations must be set manually or by another animation before applying the additive animations, else
   * the property values will increase continually.
   */
  add: 3,
};

/**
 * Indicates whether a timeline's `alpha` is mixing out over time toward 0 (the setup or current pose value) or
 * mixing in toward 1 (the timeline's value).
 *
 * See Timeline {@link Tiny.spine.Timeline#apply}.
 *
 * @readonly
 * @enum {number}
 * @memberof Tiny.spine
 */
const MixDirection = {
  mixIn: 0,
  mixOut: 1,
};

/**
 *
 * @readonly
 * @enum {number}
 * @memberof Tiny.spine
 */
const TimelineType = {
  rotate: 0,
  translate: 1,
  scale: 2,
  shear: 3,
  attachment: 4,
  color: 5,
  deform: 6,
  event: 7,
  drawOrder: 8,
  ikConstraint: 9,
  transformConstraint: 10,
  pathConstraintPosition: 11,
  pathConstraintSpacing: 12,
  pathConstraintMix: 13,
  twoColor: 14,
};

/**
 * The interface for all timelines.
 *
 * @name Timeline
 * @interface
 * @memberof Tiny.spine
 */
/**
 * Applies this timeline to the skeleton.
 *
 * @function
 * @name Tiny.spine.Timeline#apply
 * @param {Tiny.spine.Skeleton} skeleton - The skeleton the timeline is being applied to. This provides access to the bones, slots, and other skeleton components the timeline may change.
 * @param {number} lastTime - The time this timeline was last applied. Timelines such as {@link Tiny.spine.EventTimeline}} trigger only at specific times rather than every frame. In that case, the timeline triggers everything between `lastTime` (exclusive) and `time` (inclusive).
 * @param {number} time - The time within the animation. Most timelines find the key before and the key after this time so they can interpolate between the keys.
 * @param {Tiny.spine.Event[]} events - If any events are fired, they are added to this list. Can be null to ignore fired events or if the timeline does not fire events.
 * @param {number} alpha - 0 applies the current or setup value (depending on `blend`). 1 applies the timeline value. Between 0 and 1 applies a value between the current or setup value and the timeline value. By adjusting `alpha` over time, an animation can be mixed in or out. `alpha` can also be useful to apply animations on top of each other (layering).
 * @param {Tiny.spine.MixBlend} blend - Controls how mixing is applied when `alpha` < 1.
 * @param {Tiny.spine.MixDirection} direction - Indicates whether the timeline is mixing in or out. Used by timelines which perform instant transitions, such as {@link Tiny.spine.DrawOrderTimeline} or {@link Tiny.spine.AttachmentTimeline}.
 */
/**
 * @function
 * @name Tiny.spine.Timeline#getPropertyId
 * @return {number}
 */

/**
 * A simple container for a list of timelines and a name.
 *
 * @class
 * @memberof Tiny.spine
 */
class Animation {
  /**
   *
   * @param {string} name
   * @param {Tiny.spine.Timeline[]} timelines
   * @param {number} duration
   */
  constructor(name, timelines, duration) {
    if (name == null) {
      throw new Error('name cannot be null.');
    }
    if (timelines == null) {
      throw new Error('timelines cannot be null.');
    }
    /**
     * The animation's name, which is unique across all animations in the skeleton.
     *
     * @type {string}
     */
    this.name = name;
    /**
     * @type {Tiny.spine.Timeline[]}
     */
    this.timelines = timelines;
    /**
     * @type {boolean[]}
     */
    this.timelineIds = [];
    for (var i = 0; i < timelines.length; i++) {
      this.timelineIds[timelines[i].getPropertyId()] = true;
    }
    /**
     * The duration of the animation in seconds, which is the highest time of all keys in the timeline.
     *
     * @type {number}
     */
    this.duration = duration;
  }

  /**
   *
   * @param {number} id
   * @return {boolean}
   */
  hasTimeline(id) {
    return this.timelineIds[id] === true;
  }

  /**
   * Applies all the animation's timelines to the specified skeleton.
   *
   * See Timeline {@link Tiny.spine.Timeline#apply}.
   *
   * @param {Tiny.spine.Skeleton} skeleton
   * @param {number} lastTime
   * @param {number} time
   * @param {boolean} loop - If true, the animation repeats after {@link Tiny.spine.Animation#duration}.
   * @param {Tiny.spine.Event[]} events - May be null to ignore fired events.
   * @param {number} alpha
   * @param {Tiny.spine.MixBlend} blend
   * @param {Tiny.spine.MixDirection} direction
   */
  apply(skeleton, lastTime, time, loop, events, alpha, blend, direction) {
    if (skeleton == null) {
      throw new Error('skeleton cannot be null.');
    }

    if (loop && this.duration !== 0) {
      time %= this.duration;
      if (lastTime > 0) {
        lastTime %= this.duration;
      }
    }

    const timelines = this.timelines;

    for (let i = 0, n = timelines.length; i < n; i++) {
      timelines[i].apply(skeleton, lastTime, time, events, alpha, blend, direction);
    }
  }

  /**
   *
   * @static
   * @param {number[]} values
   * @param {number} target - After the first and before the last value.
   * @param {number} step=1
   * @return {number} - index of first value greater than the target.
   */
  static binarySearch(values, target, step = 1) {
    let low = 0;
    let high = values.length / step - 2;

    if (high === 0) {
      return step;
    }

    let current = high >>> 1;

    while (true) {
      if (values[(current + 1) * step] <= target) {
        low = current + 1;
      } else {
        high = current;
      }
      if (low === high) {
        return (low + 1) * step;
      }
      current = (low + high) >>> 1;
    }
  }

  /**
   * @static
   * @param {number[]} values
   * @param {number} target
   * @param {number} step
   * @return {number}
   */
  static linearSearch(values, target, step) {
    for (let i = 0, last = values.length - step; i <= last; i += step) {
      if (values[i] > target) {
        return i;
      }
    }
    return -1;
  }
}

/**
 * The base class for timelines that use interpolation between key frame values.
 *
 * @class
 * @memberof Tiny.spine
 * @implements {Tiny.spine.Timeline}
 */
class CurveTimeline {
  /**
   *
   * @param {number} frameCount
   */
  constructor(frameCount) {
    if (frameCount <= 0) {
      throw new Error(`frameCount must be > 0: ${frameCount}`);
    }
    /**
     * @type {number[]}
     * @private
     */
    this.curves = newFloatArray((frameCount - 1) * CurveTimeline.BEZIER_SIZE);
  }

  /**
   * The number of key frames for this timeline.
   *
   * @return {number}
   */
  getFrameCount() {
    return this.curves.length / CurveTimeline.BEZIER_SIZE + 1;
  }

  /**
   * Sets the specified key frame to linear interpolation.
   *
   * @param {number} frameIndex
   */
  setLinear(frameIndex) {
    this.curves[frameIndex * CurveTimeline.BEZIER_SIZE] = CurveTimeline.LINEAR;
  }

  /**
   * Sets the specified key frame to stepped interpolation.
   *
   * @param {number} frameIndex
   */
  setStepped(frameIndex) {
    this.curves[frameIndex * CurveTimeline.BEZIER_SIZE] = CurveTimeline.STEPPED;
  }

  /**
   * Returns the interpolation type for the specified key frame.
   *
   * @param {number} frameIndex
   * @return {number} Linear is 0, stepped is 1, Bezier is 2.
   */
  getCurveType(frameIndex) {
    const index = frameIndex * CurveTimeline.BEZIER_SIZE;

    if (index === this.curves.length) return CurveTimeline.LINEAR;

    const type = this.curves[index];

    if (type === CurveTimeline.LINEAR) return CurveTimeline.LINEAR;
    if (type === CurveTimeline.STEPPED) return CurveTimeline.STEPPED;
    return CurveTimeline.BEZIER;
  }

  /**
   * Sets the specified key frame to Bezier interpolation. `cx1` and `cx2` are from 0 to 1,
   * representing the percent of time between the two key frames. `cy1` and `cy2` are the percent of the
   * difference between the key frame's values.
   *
   * @param {number} frameIndex
   * @param {number} cx1
   * @param {number} cy1
   * @param {number} cx2
   * @param {number} cy2
   */
  setCurve(frameIndex, cx1, cy1, cx2, cy2) {
    let tmpx = (-cx1 * 2 + cx2) * 0.03;
    let tmpy = (-cy1 * 2 + cy2) * 0.03;
    let dddfx = ((cx1 - cx2) * 3 + 1) * 0.006;
    let dddfy = ((cy1 - cy2) * 3 + 1) * 0.006;
    let ddfx = tmpx * 2 + dddfx;
    let ddfy = tmpy * 2 + dddfy;
    let dfx = cx1 * 0.3 + tmpx + dddfx * 0.16666667;
    let dfy = cy1 * 0.3 + tmpy + dddfy * 0.16666667;

    let i = frameIndex * CurveTimeline.BEZIER_SIZE;
    const curves = this.curves;

    curves[i++] = CurveTimeline.BEZIER;

    let x = dfx;
    let y = dfy;

    for (let n = i + CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
      curves[i] = x;
      curves[i + 1] = y;
      dfx += ddfx;
      dfy += ddfy;
      ddfx += dddfx;
      ddfy += dddfy;
      x += dfx;
      y += dfy;
    }
  }

  /**
   * Returns the interpolated percentage for the specified key frame and linear percentage.
   *
   * @param {number} frameIndex
   * @param {number} percent
   */
  getCurvePercent(frameIndex, percent) {
    percent = clamp(percent, 0, 1);

    const curves = this.curves;
    let i = frameIndex * CurveTimeline.BEZIER_SIZE;
    const type = curves[i];

    if (type === CurveTimeline.LINEAR) return percent;
    if (type === CurveTimeline.STEPPED) return 0;

    i++;
    let x = 0;

    for (let start = i, n = i + CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
      x = curves[i];
      if (x >= percent) {
        let prevX;
        let prevY;

        if (i === start) {
          prevX = 0;
          prevY = 0;
        } else {
          prevX = curves[i - 2];
          prevY = curves[i - 1];
        }
        return prevY + (curves[i + 1] - prevY) * (percent - prevX) / (x - prevX);
      }
    }

    let y = curves[i - 1];

    return y + (1 - y) * (percent - x) / (1 - x); // Last point is 1,1.
  }
}
CurveTimeline.LINEAR = 0;
CurveTimeline.STEPPED = 1;
CurveTimeline.BEZIER = 2;
CurveTimeline.BEZIER_SIZE = 10 * 2 - 1;

/**
 * Changes a bone's local {@link Tiny.spine.Bone#rotation}.
 *
 * @class
 * @memberof Tiny.spine
 * @extends {Tiny.spine.CurveTimeline}
 */
class RotateTimeline extends CurveTimeline {
  /**
   *
   * @param {number} frameCount
   */
  constructor(frameCount) {
    super(frameCount);
    /**
     * The index of the bone in {@link Tiny.spine.Skeleton#bones} that will be changed.
     *
     * @name boneIndex
     * @memberof Tiny.spine.RotateTimeline.prototype
     * @type {number}
     */

    /**
     * The time in seconds and rotation in degrees for each key frame.
     *
     * @type {number[]}
     */
    this.frames = newFloatArray(frameCount << 1);
  }

  /**
   * @see {Tiny.spine.Timeline#getPropertyId}
   * @return {number}
   */
  getPropertyId() {
    return (TimelineType.rotate << 24) + this.boneIndex;
  }

  /**
   * Sets the time and angle of the specified keyframe.
   *
   * @param {number} frameIndex
   * @param {number} time
   * @param {number} degrees
   */
  setFrame(frameIndex, time, degrees) {
    frameIndex <<= 1;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + RotateTimeline.ROTATION] = degrees;
  }

  /**
   * @see {Tiny.spine.Timeline#apply}
   */
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    const frames = this.frames;
    const bone = skeleton.bones[this.boneIndex];

    if (!bone.active) {
      return;
    }
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          bone.rotation = bone.data.rotation;
          return;
        case MixBlend.first:
          const r = bone.data.rotation - bone.rotation;

          bone.rotation += (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * alpha;
      }
      return;
    }

    if (time >= frames[frames.length - RotateTimeline.ENTRIES]) { // Time is after last frame.
      let r = frames[frames.length + RotateTimeline.PREV_ROTATION];

      switch (blend) {
        case MixBlend.setup:
          bone.rotation = bone.data.rotation + r * alpha;
          break;
        case MixBlend.first:
        case MixBlend.replace:
          r += bone.data.rotation - bone.rotation;
          r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360; // Wrap within -180 and 180.
          // fall through
        case MixBlend.add:
          bone.rotation += r * alpha;
      }
      return;
    }

    // Interpolate between the previous frame and the current frame.
    const frame = Animation.binarySearch(frames, time, RotateTimeline.ENTRIES);
    const prevRotation = frames[frame + RotateTimeline.PREV_ROTATION];
    const frameTime = frames[frame];
    const denominator = frames[frame + RotateTimeline.PREV_TIME] - frameTime;
    const percent = this.getCurvePercent(
      (frame >> 1) - 1,
      1 - (time - frameTime) / denominator,
    );
    let r = frames[frame + RotateTimeline.ROTATION] - prevRotation;

    r = prevRotation + (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * percent;
    switch (blend) {
      case MixBlend.setup:
        bone.rotation = bone.data.rotation + (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * alpha;
        break;
      case MixBlend.first:
      case MixBlend.replace:
        r += bone.data.rotation - bone.rotation;
        // fall through
      case MixBlend.add:
        bone.rotation += (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * alpha;
    }
  }
}
RotateTimeline.ENTRIES = 2;
RotateTimeline.PREV_TIME = -2;
RotateTimeline.PREV_ROTATION = -1;
RotateTimeline.ROTATION = 1;

/**
 * Changes a bone's local {@link Tiny.spine.Bone#x} and {@link Tiny.spine.Bone#y}.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.CurveTimeline
 */
class TranslateTimeline extends CurveTimeline {
  /**
   *
   * @param {number} frameCount
   */
  constructor(frameCount) {
    super(frameCount);

    /**
     * The index of the bone in {@link Tiny.spine.Skeleton#bones} that will be changed.
     *
     * @name boneIndex
     * @memberof Tiny.spine.TranslateTimeline.prototype
     * @type {number}
     */

    /**
     * @type {number[]}
     */
    this.frames = newFloatArray(frameCount * TranslateTimeline.ENTRIES);
  }

  /**
   * @see {Tiny.spine.Timeline#getPropertyId}
   * @return {number}
   */
  getPropertyId() {
    return (TimelineType.translate << 24) + this.boneIndex;
  }

  /**
   * Sets the time in seconds, x, and y values for the specified key frame.
   *
   * @param {number} frameIndex
   * @param {number} time
   * @param {number} x
   * @param {number} y
   */
  setFrame(frameIndex, time, x, y) {
    frameIndex *= TranslateTimeline.ENTRIES;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + TranslateTimeline.X] = x;
    this.frames[frameIndex + TranslateTimeline.Y] = y;
  }

  /**
   * @see {Tiny.spine.Timeline#apply}
   */
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    const frames = this.frames;
    const bone = skeleton.bones[this.boneIndex];

    if (!bone.active) {
      return;
    }
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          bone.x = bone.data.x;
          bone.y = bone.data.y;
          return;
        case MixBlend.first:
          bone.x += (bone.data.x - bone.x) * alpha;
          bone.y += (bone.data.y - bone.y) * alpha;
      }
      return;
    }

    let x = 0;
    let y = 0;

    if (time >= frames[frames.length - TranslateTimeline.ENTRIES]) { // Time is after last frame.
      x = frames[frames.length + TranslateTimeline.PREV_X];
      y = frames[frames.length + TranslateTimeline.PREV_Y];
    } else {
      // Interpolate between the previous frame and the current frame.
      const frame = Animation.binarySearch(frames, time, TranslateTimeline.ENTRIES);

      x = frames[frame + TranslateTimeline.PREV_X];
      y = frames[frame + TranslateTimeline.PREV_Y];

      const frameTime = frames[frame];
      const denominator = frames[frame + TranslateTimeline.PREV_TIME] - frameTime;
      const percent = this.getCurvePercent(
        frame / TranslateTimeline.ENTRIES - 1,
        1 - (time - frameTime) / denominator,
      );

      x += (frames[frame + TranslateTimeline.X] - x) * percent;
      y += (frames[frame + TranslateTimeline.Y] - y) * percent;
    }
    switch (blend) {
      case MixBlend.setup:
        bone.x = bone.data.x + x * alpha;
        bone.y = bone.data.y + y * alpha;
        break;
      case MixBlend.first:
      case MixBlend.replace:
        bone.x += (bone.data.x + x - bone.x) * alpha;
        bone.y += (bone.data.y + y - bone.y) * alpha;
        break;
      case MixBlend.add:
        bone.x += x * alpha;
        bone.y += y * alpha;
    }
  }
}
TranslateTimeline.ENTRIES = 3;
TranslateTimeline.PREV_TIME = -3;
TranslateTimeline.PREV_X = -2;
TranslateTimeline.PREV_Y = -1;
TranslateTimeline.X = 1;
TranslateTimeline.Y = 2;

/**
 * Changes a bone's local {@link Tiny.spine.Bone#scaleX)} and {@link Tiny.spine.Bone#scaleY}.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.TranslateTimeline
 */
class ScaleTimeline extends TranslateTimeline {
  /**
   *
   * @param {number} frameCount
   */
  constructor(frameCount) {
    super(frameCount);
  }
  /**
   * @see {Tiny.spine.Timeline#getPropertyId}
   * @return {number}
   */
  getPropertyId() {
    return (TimelineType.scale << 24) + this.boneIndex;
  }

  /**
   * @see {Tiny.spine.Timeline#apply}
   */
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    const frames = this.frames;
    const bone = skeleton.bones[this.boneIndex];

    if (!bone.active) {
      return;
    }
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          bone.scaleX = bone.data.scaleX;
          bone.scaleY = bone.data.scaleY;
          return;
        case MixBlend.first:
          bone.scaleX += (bone.data.scaleX - bone.scaleX) * alpha;
          bone.scaleY += (bone.data.scaleY - bone.scaleY) * alpha;
      }
      return;
    }

    let x = 0;
    let y = 0;

    if (time >= frames[frames.length - ScaleTimeline.ENTRIES]) { // Time is after last frame.
      x = frames[frames.length + ScaleTimeline.PREV_X] * bone.data.scaleX;
      y = frames[frames.length + ScaleTimeline.PREV_Y] * bone.data.scaleY;
    } else {
      // Interpolate between the previous frame and the current frame.
      const frame = Animation.binarySearch(frames, time, ScaleTimeline.ENTRIES);

      x = frames[frame + ScaleTimeline.PREV_X];
      y = frames[frame + ScaleTimeline.PREV_Y];

      const frameTime = frames[frame];
      const denominator = frames[frame + ScaleTimeline.PREV_TIME] - frameTime;
      const percent = this.getCurvePercent(
        frame / ScaleTimeline.ENTRIES - 1,
        1 - (time - frameTime) / denominator,
      );

      x = (x + (frames[frame + ScaleTimeline.X] - x) * percent) * bone.data.scaleX;
      y = (y + (frames[frame + ScaleTimeline.Y] - y) * percent) * bone.data.scaleY;
    }
    if (alpha === 1) {
      if (blend === MixBlend.add) {
        bone.scaleX += x - bone.data.scaleX;
        bone.scaleY += y - bone.data.scaleY;
      } else {
        bone.scaleX = x;
        bone.scaleY = y;
      }
    } else {
      let bx = 0;
      let by = 0;

      if (direction === MixDirection.mixOut) {
        switch (blend) {
          case MixBlend.setup:
            bx = bone.data.scaleX;
            by = bone.data.scaleY;
            bone.scaleX = bx + (Math.abs(x) * signum(bx) - bx) * alpha;
            bone.scaleY = by + (Math.abs(y) * signum(by) - by) * alpha;
            break;
          case MixBlend.first:
          case MixBlend.replace:
            bx = bone.scaleX;
            by = bone.scaleY;
            bone.scaleX = bx + (Math.abs(x) * signum(bx) - bx) * alpha;
            bone.scaleY = by + (Math.abs(y) * signum(by) - by) * alpha;
            break;
          case MixBlend.add:
            bx = bone.scaleX;
            by = bone.scaleY;
            bone.scaleX = bx + (Math.abs(x) * signum(bx) - bone.data.scaleX) * alpha;
            bone.scaleY = by + (Math.abs(y) * signum(by) - bone.data.scaleY) * alpha;
        }
      } else {
        switch (blend) {
          case MixBlend.setup:
            bx = Math.abs(bone.data.scaleX) * signum(x);
            by = Math.abs(bone.data.scaleY) * signum(y);
            bone.scaleX = bx + (x - bx) * alpha;
            bone.scaleY = by + (y - by) * alpha;
            break;
          case MixBlend.first:
          case MixBlend.replace:
            bx = Math.abs(bone.scaleX) * signum(x);
            by = Math.abs(bone.scaleY) * signum(y);
            bone.scaleX = bx + (x - bx) * alpha;
            bone.scaleY = by + (y - by) * alpha;
            break;
          case MixBlend.add:
            bx = signum(x);
            by = signum(y);
            bone.scaleX = Math.abs(bone.scaleX) * bx + (x - Math.abs(bone.data.scaleX) * bx) * alpha;
            bone.scaleY = Math.abs(bone.scaleY) * by + (y - Math.abs(bone.data.scaleY) * by) * alpha;
        }
      }
    }
  }
}

/**
 * Changes a bone's local {@link Tiny.spine.Bone#shearX} and {@link Tiny.spine.Bone#shearY}.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.TranslateTimeline
 */
class ShearTimeline extends TranslateTimeline {
  /**
   *
   * @param {number} frameCount
   */
  constructor(frameCount) {
    super(frameCount);
  }
  /**
   * @see {Tiny.spine.Timeline#getPropertyId}
   * @return {number}
   */
  getPropertyId() {
    return (TimelineType.shear << 24) + this.boneIndex;
  }

  /**
   * @see {Tiny.spine.Timeline#apply}
   */
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    const frames = this.frames;
    const bone = skeleton.bones[this.boneIndex];

    if (!bone.active) {
      return;
    }
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          bone.shearX = bone.data.shearX;
          bone.shearY = bone.data.shearY;
          return;
        case MixBlend.first:
          bone.shearX += (bone.data.shearX - bone.shearX) * alpha;
          bone.shearY += (bone.data.shearY - bone.shearY) * alpha;
      }
      return;
    }

    let x = 0;
    let y = 0;
    if (time >= frames[frames.length - ShearTimeline.ENTRIES]) { // Time is after last frame.
      x = frames[frames.length + ShearTimeline.PREV_X];
      y = frames[frames.length + ShearTimeline.PREV_Y];
    } else {
      // Interpolate between the previous frame and the current frame.
      const frame = Animation.binarySearch(frames, time, ShearTimeline.ENTRIES);

      x = frames[frame + ShearTimeline.PREV_X];
      y = frames[frame + ShearTimeline.PREV_Y];

      const frameTime = frames[frame];
      const denominator = frames[frame + ShearTimeline.PREV_TIME] - frameTime;
      const percent = this.getCurvePercent(
        frame / ShearTimeline.ENTRIES - 1,
        1 - (time - frameTime) / denominator,
      );

      x = x + (frames[frame + ShearTimeline.X] - x) * percent;
      y = y + (frames[frame + ShearTimeline.Y] - y) * percent;
    }
    switch (blend) {
      case MixBlend.setup:
        bone.shearX = bone.data.shearX + x * alpha;
        bone.shearY = bone.data.shearY + y * alpha;
        break;
      case MixBlend.first:
      case MixBlend.replace:
        bone.shearX += (bone.data.shearX + x - bone.shearX) * alpha;
        bone.shearY += (bone.data.shearY + y - bone.shearY) * alpha;
        break;
      case MixBlend.add:
        bone.shearX += x * alpha;
        bone.shearY += y * alpha;
    }
  }
}

/**
 * Changes a slot's {@link Tiny.spine.Slot#color}.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.CurveTimeline
 */
class ColorTimeline extends CurveTimeline {
  /**
   *
   * @param {number} frameCount
   */
  constructor(frameCount) {
    super(frameCount);

    /**
     * The index of the slot in {@link Tiny.spine.Skeleton#slots} that will be changed.
     *
     * @name slotIndex
     * @type {number}
     * @memberof Tiny.spine.ColorTimeline.prototype
     */

    /**
     * @type {number[]}
     */
    this.frames = newFloatArray(frameCount * ColorTimeline.ENTRIES);
  }

  /**
   * @see {Tiny.spine.Timeline#getPropertyId}
   * @return {number}
   */
  getPropertyId() {
    return (TimelineType.color << 24) + this.slotIndex;
  }

  /**
   * Sets the time in seconds, red, green, blue, and alpha for the specified key frame.
   *
   * @param {number} frameIndex
   * @param {number} time
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @param {number} a
   */
  setFrame(frameIndex, time, r, g, b, a) {
    frameIndex *= ColorTimeline.ENTRIES;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + ColorTimeline.R] = r;
    this.frames[frameIndex + ColorTimeline.G] = g;
    this.frames[frameIndex + ColorTimeline.B] = b;
    this.frames[frameIndex + ColorTimeline.A] = a;
  }

  /**
   * @see {Tiny.spine.Timeline#apply}
   */
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    const slot = skeleton.slots[this.slotIndex];

    if (!slot.bone.active) {
      return;
    }

    const frames = this.frames;

    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          slot.color.setFromColor(slot.data.color);
          return;
        case MixBlend.first:
          const color = slot.color;
          const setup = slot.data.color;

          color.add(
            (setup.r - color.r) * alpha,
            (setup.g - color.g) * alpha,
            (setup.b - color.b) * alpha,
            (setup.a - color.a) * alpha
          );
      }
      return;
    }

    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;

    if (time >= frames[frames.length - ColorTimeline.ENTRIES]) { // Time is after last frame.
      const i = frames.length;

      r = frames[i + ColorTimeline.PREV_R];
      g = frames[i + ColorTimeline.PREV_G];
      b = frames[i + ColorTimeline.PREV_B];
      a = frames[i + ColorTimeline.PREV_A];
    } else {
      // Interpolate between the previous frame and the current frame.
      const frame = Animation.binarySearch(frames, time, ColorTimeline.ENTRIES);

      r = frames[frame + ColorTimeline.PREV_R];
      g = frames[frame + ColorTimeline.PREV_G];
      b = frames[frame + ColorTimeline.PREV_B];
      a = frames[frame + ColorTimeline.PREV_A];

      const frameTime = frames[frame];
      const denominator = frames[frame + ColorTimeline.PREV_TIME] - frameTime;
      const percent = this.getCurvePercent(
        frame / ColorTimeline.ENTRIES - 1,
        1 - (time - frameTime) / denominator,
      );

      r += (frames[frame + ColorTimeline.R] - r) * percent;
      g += (frames[frame + ColorTimeline.G] - g) * percent;
      b += (frames[frame + ColorTimeline.B] - b) * percent;
      a += (frames[frame + ColorTimeline.A] - a) * percent;
    }
    if (alpha === 1) {
      slot.color.set(r, g, b, a);
    } else {
      const color = slot.color;

      if (blend === MixBlend.setup) {
        color.setFromColor(slot.data.color);
      }
      color.add(
        (r - color.r) * alpha,
        (g - color.g) * alpha,
        (b - color.b) * alpha,
        (a - color.a) * alpha
      );
    }
  }
}
ColorTimeline.ENTRIES = 5;
ColorTimeline.PREV_TIME = -5;
ColorTimeline.PREV_R = -4;
ColorTimeline.PREV_G = -3;
ColorTimeline.PREV_B = -2;
ColorTimeline.PREV_A = -1;
ColorTimeline.R = 1;
ColorTimeline.G = 2;
ColorTimeline.B = 3;
ColorTimeline.A = 4;

/**
 * Changes a slot's {@link Tiny.spine.Slot#color} and {@link Tiny.spine.Slot#darkColor} for two color tinting.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.CurveTimeline
 */
class TwoColorTimeline extends CurveTimeline {
  /**
   *
   * @param {number} frameCount
   */
  constructor(frameCount) {
    super(frameCount);

    /**
     * The index of the slot in {@link Tiny.spine.Skeleton#slots()} that will be changed.
     * The {@link Tiny.spine.Slot#darkColor()} must not be null.
     * @name slotIndex
     * @memberof Tiny.spine.TwoColorTimeline.prototype
     */

    /**
     * The time in seconds, red, green, blue, and alpha values of the color, red, green, blue of the dark color, for each key frame.
     *
     * @type {number[]}
     */
    this.frames = newFloatArray(frameCount * TwoColorTimeline.ENTRIES);
  }

  /**
   * @see {Tiny.spine.Timeline#getPropertyId}
   * @return {number}
   */
  getPropertyId() {
    return (TimelineType.twoColor << 24) + this.slotIndex;
  }

  /**
   * Sets the time in seconds, light, and dark colors for the specified key frame.
   *
   * @param {number} frameIndex
   * @param {number} time
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @param {number} a
   * @param {number} r2
   * @param {number} g2
   * @param {number} b2
   */
  setFrame(frameIndex, time, r, g, b, a, r2, g2, b2) {
    frameIndex *= TwoColorTimeline.ENTRIES;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + TwoColorTimeline.R] = r;
    this.frames[frameIndex + TwoColorTimeline.G] = g;
    this.frames[frameIndex + TwoColorTimeline.B] = b;
    this.frames[frameIndex + TwoColorTimeline.A] = a;
    this.frames[frameIndex + TwoColorTimeline.R2] = r2;
    this.frames[frameIndex + TwoColorTimeline.G2] = g2;
    this.frames[frameIndex + TwoColorTimeline.B2] = b2;
  }

  /**
   * @see {Tiny.spine.Timeline#apply}
   */
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    const slot = skeleton.slots[this.slotIndex];

    if (!slot.bone.active) {
      return;
    }

    const frames = this.frames;

    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          slot.color.setFromColor(slot.data.color);
          slot.darkColor.setFromColor(slot.data.darkColor);
          return;
        case MixBlend.first:
          const light = slot.color;
          const dark = slot.darkColor;
          const setupLight = slot.data.color;
          const setupDark = slot.data.darkColor;

          light.add(
            (setupLight.r - light.r) * alpha,
            (setupLight.g - light.g) * alpha,
            (setupLight.b - light.b) * alpha,
            (setupLight.a - light.a) * alpha,
          );
          dark.add(
            (setupDark.r - dark.r) * alpha,
            (setupDark.g - dark.g) * alpha,
            (setupDark.b - dark.b) * alpha,
            0,
          );
      }
      return;
    }

    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;
    let r2 = 0;
    let g2 = 0;
    let b2 = 0;

    if (time >= frames[frames.length - TwoColorTimeline.ENTRIES]) { // Time is after last frame.
      const i = frames.length;

      r = frames[i + TwoColorTimeline.PREV_R];
      g = frames[i + TwoColorTimeline.PREV_G];
      b = frames[i + TwoColorTimeline.PREV_B];
      a = frames[i + TwoColorTimeline.PREV_A];
      r2 = frames[i + TwoColorTimeline.PREV_R2];
      g2 = frames[i + TwoColorTimeline.PREV_G2];
      b2 = frames[i + TwoColorTimeline.PREV_B2];
    } else {
      // Interpolate between the previous frame and the current frame.
      const frame = Animation.binarySearch(frames, time, TwoColorTimeline.ENTRIES);

      r = frames[frame + TwoColorTimeline.PREV_R];
      g = frames[frame + TwoColorTimeline.PREV_G];
      b = frames[frame + TwoColorTimeline.PREV_B];
      a = frames[frame + TwoColorTimeline.PREV_A];
      r2 = frames[frame + TwoColorTimeline.PREV_R2];
      g2 = frames[frame + TwoColorTimeline.PREV_G2];
      b2 = frames[frame + TwoColorTimeline.PREV_B2];

      const frameTime = frames[frame];
      const denominator = frames[frame + TwoColorTimeline.PREV_TIME] - frameTime;
      const percent = this.getCurvePercent(
        frame / TwoColorTimeline.ENTRIES - 1,
        1 - (time - frameTime) / denominator,
      );

      r += (frames[frame + TwoColorTimeline.R] - r) * percent;
      g += (frames[frame + TwoColorTimeline.G] - g) * percent;
      b += (frames[frame + TwoColorTimeline.B] - b) * percent;
      a += (frames[frame + TwoColorTimeline.A] - a) * percent;
      r2 += (frames[frame + TwoColorTimeline.R2] - r2) * percent;
      g2 += (frames[frame + TwoColorTimeline.G2] - g2) * percent;
      b2 += (frames[frame + TwoColorTimeline.B2] - b2) * percent;
    }
    if (alpha === 1) {
      slot.color.set(r, g, b, a);
      slot.darkColor.set(r2, g2, b2, 1);
    } else {
      const light = slot.color;
      const dark = slot.darkColor;

      if (blend === MixBlend.setup) {
        light.setFromColor(slot.data.color);
        dark.setFromColor(slot.data.darkColor);
      }
      light.add(
        (r - light.r) * alpha,
        (g - light.g) * alpha,
        (b - light.b) * alpha,
        (a - light.a) * alpha,
      );
      dark.add(
        (r2 - dark.r) * alpha,
        (g2 - dark.g) * alpha,
        (b2 - dark.b) * alpha,
        0,
      );
    }
  }
}
TwoColorTimeline.ENTRIES = 8;
TwoColorTimeline.PREV_TIME = -8;
TwoColorTimeline.PREV_R = -7;
TwoColorTimeline.PREV_G = -6;
TwoColorTimeline.PREV_B = -5;
TwoColorTimeline.PREV_A = -4;
TwoColorTimeline.PREV_R2 = -3;
TwoColorTimeline.PREV_G2 = -2;
TwoColorTimeline.PREV_B2 = -1;
TwoColorTimeline.R = 1;
TwoColorTimeline.G = 2;
TwoColorTimeline.B = 3;
TwoColorTimeline.A = 4;
TwoColorTimeline.R2 = 5;
TwoColorTimeline.G2 = 6;
TwoColorTimeline.B2 = 7;

/**
 * Changes a slot's {@link Tiny.spine.Slot#attachment}.
 *
 * @class
 * @memberof Tiny.spine
 */
class AttachmentTimeline {
  /**
   *
   * @param {number} frameCount
   */
  constructor(frameCount) {
    /**
     * @name slotIndex
     * @memberof Tiny.spine.AttachmentTimeline.prototype
     * @type {number}
     */

    /**
     * The time in seconds for each key frame.
     *
     * @type {number[]}
     */
    this.frames = newFloatArray(frameCount);

    /**
     * The attachment name for each key frame. May contain null values to clear the attachment.
     *
     * @type {string[]}
     */
    this.attachmentNames = new Array(frameCount);
  }

  /**
   * @see {Tiny.spine.Timeline#getPropertyId}
   * @return {number}
   */
  getPropertyId() {
    return (TimelineType.attachment << 24) + this.slotIndex;
  }

  /**
   * The number of key frames for this timeline.
   *
   * @return {number}
   */
  getFrameCount() {
    return this.frames.length;
  }

  /**
   * Sets the time in seconds and the attachment name for the specified key frame.
   *
   * @param {number} frameIndex
   * @param {number} time
   * @param {number} attachmentName
   */
  setFrame(frameIndex, time, attachmentName) {
    this.frames[frameIndex] = time;
    this.attachmentNames[frameIndex] = attachmentName;
  }

  /**
   * @see {Tiny.spine.Timeline#apply}
   */
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    const slot = skeleton.slots[this.slotIndex];

    if (!slot.bone.active) {
      return;
    }
    if (direction === MixDirection.mixOut && blend === MixBlend.setup) {
      const attachmentName = slot.data.attachmentName;

      slot.setAttachment(attachmentName == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName));
      return;
    }

    const frames = this.frames;

    if (time < frames[0]) {
      if (blend === MixBlend.setup || blend === MixBlend.first) {
        const attachmentName = slot.data.attachmentName;

        slot.setAttachment(attachmentName == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName));
      }
      return;
    }

    let frameIndex = 0;

    if (time >= frames[frames.length - 1]) { // Time is after last frame.
      frameIndex = frames.length - 1;
    } else {
      frameIndex = Animation.binarySearch(frames, time, 1) - 1;
    }

    const attachmentName = this.attachmentNames[frameIndex];

    skeleton.slots[this.slotIndex].setAttachment(attachmentName == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName));
  }
}

let zeros = null;

/**
 * Changes a slot's {@link Tiny.spine.Slot#deform} to deform a {@link Tiny.spine.VertexAttachment}.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.CurveTimeline
 */
class DeformTimeline extends CurveTimeline {
  /**
   *
   * @param {number} frameCount
   */
  constructor(frameCount) {
    super(frameCount);
    /**
     * @name slotIndex
     * @memberof Tiny.spine.DeformTimeline.prototype
     * @type {number}
     */
    /**
     * @name attachment
     * @memberof Tiny.spine.DeformTimeline.prototype
     * @type {Tiny.spine.VertexAttachment}
     */

    /**
     * @type {number[]}
     */
    this.frames = newFloatArray(frameCount);
    /**
     * @type {array<number[]>}
     */
    this.frameVertices = new Array(frameCount);

    if (zeros == null) {
      zeros = newFloatArray(64);
    }
  }

  /**
   * @see {Tiny.spine.Timeline#getPropertyId}
   * @return {number}
   */
  getPropertyId() {
    return (TimelineType.deform << 27) + +this.attachment.id + this.slotIndex;
  }

  /**
   * Sets the time in seconds and the vertices for the specified key frame.
   *
   * @param {number} frameIndex
   * @param {number} time
   * @param {number[]} vertices - Vertex positions for an unweighted VertexAttachment, or deform offsets if it has weights.
   */
  setFrame(frameIndex, time, vertices) {
    this.frames[frameIndex] = time;
    this.frameVertices[frameIndex] = vertices;
  }

  /**
   * @see {Tiny.spine.Timeline#apply}
   */
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    const slot = skeleton.slots[this.slotIndex];

    if (!slot.bone.active) {
      return;
    }

    const slotAttachment = slot.getAttachment();

    if (!(slotAttachment instanceof VertexAttachment) || !((slotAttachment).deformAttachment === this.attachment)) {
      return;
    }

    const deformArray = slot.deform;

    if (deformArray.length === 0) {
      blend = MixBlend.setup;
    }

    const frameVertices = this.frameVertices;
    const vertexCount = frameVertices[0].length;
    const frames = this.frames;

    if (time < frames[0]) {
      const vertexAttachment = slotAttachment;

      switch (blend) {
        case MixBlend.setup:
          deformArray.length = 0;
          return;
        case MixBlend.first:
          if (alpha === 1) {
            deformArray.length = 0;
            break;
          }
          let deform = setArraySize(deformArray, vertexCount);

          if (vertexAttachment.bones == null) {
            // Unweighted vertex positions.
            const setupVertices = vertexAttachment.vertices;

            for (let i = 0; i < vertexCount; i++) {
              deform[i] += (setupVertices[i] - deform[i]) * alpha;
            }
          } else {
            // Weighted deform offsets.
            alpha = 1 - alpha;
            for (let i = 0; i < vertexCount; i++) {
              deform[i] *= alpha;
            }
          }
      }
      return;
    }

    let deform = setArraySize(deformArray, vertexCount);

    if (time >= frames[frames.length - 1]) { // Time is after last frame.
      const lastVertices = frameVertices[frames.length - 1];

      if (alpha === 1) {
        if (blend === MixBlend.add) {
          const vertexAttachment = slotAttachment;

          if (vertexAttachment.bones == null) {
            // Unweighted vertex positions, with alpha.
            const setupVertices = vertexAttachment.vertices;

            for (let i = 0; i < vertexCount; i++) {
              deform[i] += lastVertices[i] - setupVertices[i];
            }
          } else {
            // Weighted deform offsets, with alpha.
            for (let i = 0; i < vertexCount; i++) {
              deform[i] += lastVertices[i];
            }
          }
        } else {
          arrayCopy(lastVertices, 0, deform, 0, vertexCount);
        }
      } else {
        switch (blend) {
          case MixBlend.setup: {
            const vertexAttachment = slotAttachment;

            if (vertexAttachment.bones == null) {
              // Unweighted vertex positions, with alpha.
              const setupVertices = vertexAttachment.vertices;

              for (let i = 0; i < vertexCount; i++) {
                const setup = setupVertices[i];

                deform[i] = setup + (lastVertices[i] - setup) * alpha;
              }
            } else {
              // Weighted deform offsets, with alpha.
              for (let i = 0; i < vertexCount; i++) {
                deform[i] = lastVertices[i] * alpha;
              }
            }
            break;
          }
          case MixBlend.first:
          case MixBlend.replace:
            for (let i = 0; i < vertexCount; i++) {
              deform[i] += (lastVertices[i] - deform[i]) * alpha;
            }
            break;
          case MixBlend.add:
            const vertexAttachment = slotAttachment;

            if (vertexAttachment.bones == null) {
              // Unweighted vertex positions, with alpha.
              const setupVertices = vertexAttachment.vertices;

              for (let i = 0; i < vertexCount; i++) {
                deform[i] += (lastVertices[i] - setupVertices[i]) * alpha;
              }
            } else {
              // Weighted deform offsets, with alpha.
              for (let i = 0; i < vertexCount; i++) {
                deform[i] += lastVertices[i] * alpha;
              }
            }
        }
      }
      return;
    }

    // Interpolate between the previous frame and the current frame.
    const frame = Animation.binarySearch(frames, time);
    const prevVertices = frameVertices[frame - 1];
    const nextVertices = frameVertices[frame];
    const frameTime = frames[frame];
    const percent = this.getCurvePercent(
      frame - 1,
      1 - (time - frameTime) / (frames[frame - 1] - frameTime)
    );

    if (alpha === 1) {
      if (blend === MixBlend.add) {
        const vertexAttachment = slotAttachment;

        if (vertexAttachment.bones == null) {
          // Unweighted vertex positions, with alpha.
          const setupVertices = vertexAttachment.vertices;

          for (let i = 0; i < vertexCount; i++) {
            const prev = prevVertices[i];

            deform[i] += prev + (nextVertices[i] - prev) * percent - setupVertices[i];
          }
        } else {
          // Weighted deform offsets, with alpha.
          for (let i = 0; i < vertexCount; i++) {
            const prev = prevVertices[i];

            deform[i] += prev + (nextVertices[i] - prev) * percent;
          }
        }
      } else {
        for (let i = 0; i < vertexCount; i++) {
          const prev = prevVertices[i];

          deform[i] = prev + (nextVertices[i] - prev) * percent;
        }
      }
    } else {
      switch (blend) {
        case MixBlend.setup: {
          const vertexAttachment = slotAttachment;

          if (vertexAttachment.bones == null) {
            // Unweighted vertex positions, with alpha.
            const setupVertices = vertexAttachment.vertices;

            for (let i = 0; i < vertexCount; i++) {
              const prev = prevVertices[i];
              const setup = setupVertices[i];

              deform[i] = setup + (prev + (nextVertices[i] - prev) * percent - setup) * alpha;
            }
          } else {
            // Weighted deform offsets, with alpha.
            for (let i = 0; i < vertexCount; i++) {
              const prev = prevVertices[i];

              deform[i] = (prev + (nextVertices[i] - prev) * percent) * alpha;
            }
          }
          break;
        }
        case MixBlend.first:
        case MixBlend.replace:
          for (let i = 0; i < vertexCount; i++) {
            const prev = prevVertices[i];

            deform[i] += (prev + (nextVertices[i] - prev) * percent - deform[i]) * alpha;
          }
          break;
        case MixBlend.add:
          const vertexAttachment = slotAttachment;

          if (vertexAttachment.bones == null) {
            // Unweighted vertex positions, with alpha.
            const setupVertices = vertexAttachment.vertices;

            for (let i = 0; i < vertexCount; i++) {
              const prev = prevVertices[i];

              deform[i] += (prev + (nextVertices[i] - prev) * percent - setupVertices[i]) * alpha;
            }
          } else {
            // Weighted deform offsets, with alpha.
            for (let i = 0; i < vertexCount; i++) {
              const prev = prevVertices[i];

              deform[i] += (prev + (nextVertices[i] - prev) * percent) * alpha;
            }
          }
      }
    }
  }
}

/**
 * Fires an {@link Tiny.spine.Event} when specific animation times are reached.
 *
 * @class
 * @memberof Tiny.spine
 * @implements {Tiny.spine.Timeline}
 */
class EventTimeline {
  /**
   *
   * @param {number} frameCount
   */
  constructor(frameCount) {
    /**
     * @type {number[]}
     */
    this.frames = newFloatArray(frameCount);
    /**
     * @type {Tiny.spine.Event[]}
     */
    this.events = new Array(frameCount);
  }

  /**
   * @see {Tiny.spine.Timeline#getPropertyId}
   * @return {number}
   */
  getPropertyId() {
    return TimelineType.event << 24;
  }

  /**
   * The number of key frames for this timeline.
   */
  getFrameCount() {
    return this.frames.length;
  }

  /**
   * Sets the time in seconds and the event for the specified key frame.
   *
   * @param {number} frameIndex
   * @param {Tiny.spine.Event} event
   */
  setFrame(frameIndex, event) {
    this.frames[frameIndex] = event.time;
    this.events[frameIndex] = event;
  }

  /**
   * Fires events for frames > `lastTime` and <= `time`.
   *
   * @see {Tiny.spine.Timeline#apply}
   */
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    if (firedEvents == null) {
      return;
    }
    const frames = this.frames;
    const frameCount = this.frames.length;

    if (lastTime > time) { // Fire events after last time for looped animations.
      this.apply(skeleton, lastTime, Number.MAX_VALUE, firedEvents, alpha, blend, direction);
      lastTime = -1;
    } else if (lastTime >= frames[frameCount - 1]) { // Last time is after last frame.
      return;
    }
    if (time < frames[0]) {
      // Time is before first frame.
      return;
    }

    let frame = 0;

    if (lastTime < frames[0]) {
      frame = 0;
    } else {
      frame = Animation.binarySearch(frames, lastTime);

      const frameTime = frames[frame];

      while (frame > 0) { // Fire multiple events with the same frame.
        if (frames[frame - 1] !== frameTime) {
          break;
        }
        frame--;
      }
    }
    for (; frame < frameCount && time >= frames[frame]; frame++) {
      firedEvents.push(this.events[frame]);
    }
  }
}

/**
 * Changes a skeleton's {@link Tiny.spine.Skeleton#drawOrder}.
 *
 * @class
 * @memberof Tiny.spine
 */
class DrawOrderTimeline {
  /**
   *
   * @param {number} frameCount
   */
  constructor(frameCount) {
    /**
     * The time in seconds for each key frame.
     *
     * @type {number[]}
     */
    this.frames = newFloatArray(frameCount);
    /**
     * The draw order for each key frame. See {@link Tiny.spine.DrawOrderTimeline#setFrame}.
     *
     * @type {array<number[]>}
     */
    this.drawOrders = new Array(frameCount);
  }

  /**
   * @see {Tiny.spine.Timeline#getPropertyId}
   * @return {number}
   */
  getPropertyId() {
    return TimelineType.drawOrder << 24;
  }

  /**
   * The number of key frames for this timeline.
   *
   * @return {number}
   */
  getFrameCount() {
    return this.frames.length;
  }

  /**
   * Sets the time in seconds and the draw order for the specified key frame.
   *
   * @param {number} frameIndex
   * @param {number} time
   * @param {number[]} drawOrder - For each slot in {@link Tiny.spine.Skeleton#slots}, the index of the new draw order. May be null to use setup pose draw order.
   */
  setFrame(frameIndex, time, drawOrder) {
    this.frames[frameIndex] = time;
    this.drawOrders[frameIndex] = drawOrder;
  }

  /**
   * @see {Tiny.spine.Timeline#apply}
   */
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    const drawOrder = skeleton.drawOrder;
    const slots = skeleton.slots;

    if (direction === MixDirection.mixOut && blend === MixBlend.setup) {
      arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
      return;
    }

    const frames = this.frames;

    if (time < frames[0]) {
      if (blend === MixBlend.setup || blend === MixBlend.first) {
        arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
      }
      return;
    }

    let frame = 0;

    if (time >= frames[frames.length - 1]) { // Time is after last frame.
      frame = frames.length - 1;
    } else {
      frame = Animation.binarySearch(frames, time) - 1;
    }

    const drawOrderToSetupIndex = this.drawOrders[frame];

    if (drawOrderToSetupIndex == null) {
      arrayCopy(slots, 0, drawOrder, 0, slots.length);
    } else {
      for (let i = 0, n = drawOrderToSetupIndex.length; i < n; i++) {
        drawOrder[i] = slots[drawOrderToSetupIndex[i]];
      }
    }
  }
}

/**
 * Changes an IK constraint's {@link Tiny.spine.IKConstraint#mix}, {@link Tiny.spine.IKConstraint#softness},
 * {@link Tiny.spine.IKConstraint#bendDirection}, {@link Tiny.spine.IKConstraint#stretch}, and {@link Tiny.spine.IKConstraint#compress}.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.CurveTimeline
 */
class IKConstraintTimeline extends CurveTimeline {
  /**
   *
   * @param {number} frameCount
   */
  constructor(frameCount) {
    super(frameCount);

    /**
     * The index of the IK constraint slot in {@link Tiny.spine.Skeleton#ikConstraints} that will be changed.
     *
     * @name ikConstraintIndex
     * @memberof Tiny.spine.IKConstraintTimeline.prototype
     * @type {number}
     */

    /**
     * The time in seconds, mix, softness, bend direction, compress, and stretch for each key frame.
     *
     * @type {number[]}
     */
    this.frames = newFloatArray(frameCount * IKConstraintTimeline.ENTRIES);
  }

  /**
   * @see {Tiny.spine.Timeline#getPropertyId}
   * @return {number}
   */
  getPropertyId() {
    return (TimelineType.ikConstraint << 24) + this.ikConstraintIndex;
  }

  /**
   * Sets the time in seconds, mix, softness, bend direction, compress, and stretch for the specified key frame.
   *
   * @param {number} frameIndex
   * @param {number} time
   * @param {number} mix
   * @param {number} softness
   * @param {number} bendDirection
   * @param {boolean} compress
   * @param {boolean} stretch
   */
  setFrame(frameIndex, time, mix, softness, bendDirection, compress, stretch) {
    frameIndex *= IKConstraintTimeline.ENTRIES;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + IKConstraintTimeline.MIX] = mix;
    this.frames[frameIndex + IKConstraintTimeline.SOFTNESS] = softness;
    this.frames[frameIndex + IKConstraintTimeline.BEND_DIRECTION] = bendDirection;
    this.frames[frameIndex + IKConstraintTimeline.COMPRESS] = compress ? 1 : 0;
    this.frames[frameIndex + IKConstraintTimeline.STRETCH] = stretch ? 1 : 0;
  }

  /**
   * @see {Tiny.spine.Timeline#apply}
   */
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    const frames = this.frames;
    const constraint = skeleton.ikConstraints[this.ikConstraintIndex];

    if (!constraint.active) {
      return;
    }
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          constraint.mix = constraint.data.mix;
          constraint.softness = constraint.data.softness;
          constraint.bendDirection = constraint.data.bendDirection;
          constraint.compress = constraint.data.compress;
          constraint.stretch = constraint.data.stretch;
          return;
        case MixBlend.first:
          constraint.mix += (constraint.data.mix - constraint.mix) * alpha;
          constraint.softness += (constraint.data.softness - constraint.softness) * alpha;
          constraint.bendDirection = constraint.data.bendDirection;
          constraint.compress = constraint.data.compress;
          constraint.stretch = constraint.data.stretch;
      }
      return;
    }

    if (time >= frames[frames.length - IKConstraintTimeline.ENTRIES]) { // Time is after last frame.
      if (blend === MixBlend.setup) {
        constraint.mix = constraint.data.mix + (frames[frames.length + IKConstraintTimeline.PREV_MIX] - constraint.data.mix) * alpha;
        constraint.softness = constraint.data.softness + (frames[frames.length + IKConstraintTimeline.PREV_SOFTNESS] - constraint.data.softness) * alpha;
        if (direction === MixDirection.mixOut) {
          constraint.bendDirection = constraint.data.bendDirection;
          constraint.compress = constraint.data.compress;
          constraint.stretch = constraint.data.stretch;
        } else {
          constraint.bendDirection = frames[frames.length + IKConstraintTimeline.PREV_BEND_DIRECTION];
          constraint.compress = frames[frames.length + IKConstraintTimeline.PREV_COMPRESS] !== 0;
          constraint.stretch = frames[frames.length + IKConstraintTimeline.PREV_STRETCH] !== 0;
        }
      } else {
        constraint.mix += (frames[frames.length + IKConstraintTimeline.PREV_MIX] - constraint.mix) * alpha;
        constraint.softness += (frames[frames.length + IKConstraintTimeline.PREV_SOFTNESS] - constraint.softness) * alpha;
        if (direction === MixDirection.mixIn) {
          constraint.bendDirection = frames[frames.length + IKConstraintTimeline.PREV_BEND_DIRECTION];
          constraint.compress = frames[frames.length + IKConstraintTimeline.PREV_COMPRESS] !== 0;
          constraint.stretch = frames[frames.length + IKConstraintTimeline.PREV_STRETCH] !== 0;
        }
      }
      return;
    }

    // Interpolate between the previous frame and the current frame.
    const frame = Animation.binarySearch(frames, time, IKConstraintTimeline.ENTRIES);
    const mix = frames[frame + IKConstraintTimeline.PREV_MIX];
    const softness = frames[frame + IKConstraintTimeline.PREV_SOFTNESS];
    const frameTime = frames[frame];
    const denominator = frames[frame + IKConstraintTimeline.PREV_TIME] - frameTime;
    const percent = this.getCurvePercent(
      frame / IKConstraintTimeline.ENTRIES - 1,
      1 - (time - frameTime) / denominator,
    );

    if (blend === MixBlend.setup) {
      constraint.mix = constraint.data.mix + (mix + (frames[frame + IKConstraintTimeline.MIX] - mix) * percent - constraint.data.mix) * alpha;
      constraint.softness = constraint.data.softness +
        (softness + (frames[frame + IKConstraintTimeline.SOFTNESS] - softness) * percent - constraint.data.softness) * alpha;
      if (direction === MixDirection.mixOut) {
        constraint.bendDirection = constraint.data.bendDirection;
        constraint.compress = constraint.data.compress;
        constraint.stretch = constraint.data.stretch;
      } else {
        constraint.bendDirection = frames[frame + IKConstraintTimeline.PREV_BEND_DIRECTION];
        constraint.compress = frames[frame + IKConstraintTimeline.PREV_COMPRESS] !== 0;
        constraint.stretch = frames[frame + IKConstraintTimeline.PREV_STRETCH] !== 0;
      }
    } else {
      constraint.mix += (mix + (frames[frame + IKConstraintTimeline.MIX] - mix) * percent - constraint.mix) * alpha;
      constraint.softness += (softness + (frames[frame + IKConstraintTimeline.SOFTNESS] - softness) * percent - constraint.softness) * alpha;
      if (direction === MixDirection.mixIn) {
        constraint.bendDirection = frames[frame + IKConstraintTimeline.PREV_BEND_DIRECTION];
        constraint.compress = frames[frame + IKConstraintTimeline.PREV_COMPRESS] !== 0;
        constraint.stretch = frames[frame + IKConstraintTimeline.PREV_STRETCH] !== 0;
      }
    }
  }
}
IKConstraintTimeline.ENTRIES = 6;
IKConstraintTimeline.PREV_TIME = -6;
IKConstraintTimeline.PREV_MIX = -5;
IKConstraintTimeline.PREV_SOFTNESS = -4;
IKConstraintTimeline.PREV_BEND_DIRECTION = -3;
IKConstraintTimeline.PREV_COMPRESS = -2;
IKConstraintTimeline.PREV_STRETCH = -1;
IKConstraintTimeline.MIX = 1;
IKConstraintTimeline.SOFTNESS = 2;
IKConstraintTimeline.BEND_DIRECTION = 3;
IKConstraintTimeline.COMPRESS = 4;
IKConstraintTimeline.STRETCH = 5;

/**
 * Changes a transform constraint's {@link Tiny.spine.TransformConstraint#rotateMix}, {@link Tiny.spine.TransformConstraint#translateMix},
 * {@link Tiny.spine.TransformConstraint#scaleMix}, and {@link Tiny.spine.TransformConstraint#shearMix}.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.CurveTimeline
 */
class TransformConstraintTimeline extends CurveTimeline {
  constructor(frameCount) {
    super(frameCount);
    /**
     * The index of the transform constraint slot in {@link Tiny.spine.Skeleton#transformConstraints} that will be changed.
     *
     * @name transformConstraintIndex
     * @memberof Tiny.spine.TransformConstraintTimeline.prototype
     * @type {number}
     */

    /**
     * The time in seconds, rotate mix, translate mix, scale mix, and shear mix for each key frame.
     *
     * @type {number[]}
     */
    this.frames = newFloatArray(frameCount * TransformConstraintTimeline.ENTRIES);
  }

  /**
   * @see {Tiny.spine.Timeline#getPropertyId}
   * @return {number}
   */
  getPropertyId() {
    return (TimelineType.transformConstraint << 24) + this.transformConstraintIndex;
  }

  /**
   * The time in seconds, rotate mix, translate mix, scale mix, and shear mix for the specified key frame.
   *
   * @param {number} frameIndex
   * @param {number} time
   * @param {number} rotateMix
   * @param {number} translateMix
   * @param {number} scaleMix
   * @param {number} shearMix
   */
  setFrame(frameIndex, time, rotateMix, translateMix, scaleMix, shearMix) {
    frameIndex *= TransformConstraintTimeline.ENTRIES;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + TransformConstraintTimeline.ROTATE] = rotateMix;
    this.frames[frameIndex + TransformConstraintTimeline.TRANSLATE] = translateMix;
    this.frames[frameIndex + TransformConstraintTimeline.SCALE] = scaleMix;
    this.frames[frameIndex + TransformConstraintTimeline.SHEAR] = shearMix;
  }

  /**
   * @see {Tiny.spine.Timeline#apply}
   */
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    const frames = this.frames;
    const constraint = skeleton.transformConstraints[this.transformConstraintIndex];

    if (!constraint.active) {
      return;
    }
    if (time < frames[0]) {
      const data = constraint.data;

      switch (blend) {
        case MixBlend.setup:
          constraint.rotateMix = data.rotateMix;
          constraint.translateMix = data.translateMix;
          constraint.scaleMix = data.scaleMix;
          constraint.shearMix = data.shearMix;
          return;
        case MixBlend.first:
          constraint.rotateMix += (data.rotateMix - constraint.rotateMix) * alpha;
          constraint.translateMix += (data.translateMix - constraint.translateMix) * alpha;
          constraint.scaleMix += (data.scaleMix - constraint.scaleMix) * alpha;
          constraint.shearMix += (data.shearMix - constraint.shearMix) * alpha;
      }
      return;
    }

    let rotate = 0;
    let translate = 0;
    let scale = 0;
    let shear = 0;

    if (time >= frames[frames.length - TransformConstraintTimeline.ENTRIES]) { // Time is after last frame.
      const i = frames.length;

      rotate = frames[i + TransformConstraintTimeline.PREV_ROTATE];
      translate = frames[i + TransformConstraintTimeline.PREV_TRANSLATE];
      scale = frames[i + TransformConstraintTimeline.PREV_SCALE];
      shear = frames[i + TransformConstraintTimeline.PREV_SHEAR];
    } else {
      // Interpolate between the previous frame and the current frame.
      const frame = Animation.binarySearch(frames, time, TransformConstraintTimeline.ENTRIES);

      rotate = frames[frame + TransformConstraintTimeline.PREV_ROTATE];
      translate = frames[frame + TransformConstraintTimeline.PREV_TRANSLATE];
      scale = frames[frame + TransformConstraintTimeline.PREV_SCALE];
      shear = frames[frame + TransformConstraintTimeline.PREV_SHEAR];

      const frameTime = frames[frame];
      const denominator = frames[frame + TransformConstraintTimeline.PREV_TIME] - frameTime;
      const percent = this.getCurvePercent(
        frame / TransformConstraintTimeline.ENTRIES - 1,
        1 - (time - frameTime) / denominator,
      );

      rotate += (frames[frame + TransformConstraintTimeline.ROTATE] - rotate) * percent;
      translate += (frames[frame + TransformConstraintTimeline.TRANSLATE] - translate) * percent;
      scale += (frames[frame + TransformConstraintTimeline.SCALE] - scale) * percent;
      shear += (frames[frame + TransformConstraintTimeline.SHEAR] - shear) * percent;
    }
    if (blend === MixBlend.setup) {
      const data = constraint.data;

      constraint.rotateMix = data.rotateMix + (rotate - data.rotateMix) * alpha;
      constraint.translateMix = data.translateMix + (translate - data.translateMix) * alpha;
      constraint.scaleMix = data.scaleMix + (scale - data.scaleMix) * alpha;
      constraint.shearMix = data.shearMix + (shear - data.shearMix) * alpha;
    } else {
      constraint.rotateMix += (rotate - constraint.rotateMix) * alpha;
      constraint.translateMix += (translate - constraint.translateMix) * alpha;
      constraint.scaleMix += (scale - constraint.scaleMix) * alpha;
      constraint.shearMix += (shear - constraint.shearMix) * alpha;
    }
  }
}
TransformConstraintTimeline.ENTRIES = 5;
TransformConstraintTimeline.PREV_TIME = -5;
TransformConstraintTimeline.PREV_ROTATE = -4;
TransformConstraintTimeline.PREV_TRANSLATE = -3;
TransformConstraintTimeline.PREV_SCALE = -2;
TransformConstraintTimeline.PREV_SHEAR = -1;
TransformConstraintTimeline.ROTATE = 1;
TransformConstraintTimeline.TRANSLATE = 2;
TransformConstraintTimeline.SCALE = 3;
TransformConstraintTimeline.SHEAR = 4;

/**
 * Changes a path constraint's {@link Tiny.spine.PathConstraint#position}.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.CurveTimeline
 */
class PathConstraintPositionTimeline extends CurveTimeline {
  /**
   *
   * @param {number} frameCount
   */
  constructor(frameCount) {
    super(frameCount);

    /**
     * The index of the path constraint slot in {@link Tiny.spine.Skeleton#pathConstraints} that will be changed.
     *
     * @name pathConstraintIndex
     * @memberof Tiny.spine.PathConstraintPositionTimeline.prototype
     * @type {number}
     */

    /**
     * The time in seconds and path constraint position for each key fram
     *
     * @type {number[]}
     */
    this.frames = newFloatArray(frameCount * PathConstraintPositionTimeline.ENTRIES);
  }

  /**
   * @see {Tiny.spine.Timeline#getPropertyId}
   * @return {number}
   */
  getPropertyId() {
    return (TimelineType.pathConstraintPosition << 24) + this.pathConstraintIndex;
  }

  /**
   * Sets the time in seconds and path constraint position for the specified key frame.
   *
   * @param {number} frameIndex
   * @param {number} time
   * @param {number} value
   */
  setFrame(frameIndex, time, value) {
    frameIndex *= PathConstraintPositionTimeline.ENTRIES;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + PathConstraintPositionTimeline.VALUE] = value;
  }

  /**
   * @see {Tiny.spine.Timeline#apply}
   */
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    const frames = this.frames;
    const constraint = skeleton.pathConstraints[this.pathConstraintIndex];

    if (!constraint.active) {
      return;
    }
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          constraint.position = constraint.data.position;
          return;
        case MixBlend.first:
          constraint.position += (constraint.data.position - constraint.position) * alpha;
      }
      return;
    }

    let position = 0;

    if (time >= frames[frames.length - PathConstraintPositionTimeline.ENTRIES]) { // Time is after last frame.
      position = frames[frames.length + PathConstraintPositionTimeline.PREV_VALUE];
    } else {
      // Interpolate between the previous frame and the current frame.
      const frame = Animation.binarySearch(frames, time, PathConstraintPositionTimeline.ENTRIES);

      position = frames[frame + PathConstraintPositionTimeline.PREV_VALUE];

      const frameTime = frames[frame];
      const denominator = frames[frame + PathConstraintPositionTimeline.PREV_TIME] - frameTime;
      const percent = this.getCurvePercent(
        frame / PathConstraintPositionTimeline.ENTRIES - 1,
        1 - (time - frameTime) / denominator,
      );

      position += (frames[frame + PathConstraintPositionTimeline.VALUE] - position) * percent;
    }
    if (blend === MixBlend.setup) {
      constraint.position = constraint.data.position + (position - constraint.data.position) * alpha;
    } else {
      constraint.position += (position - constraint.position) * alpha;
    }
  }
}
PathConstraintPositionTimeline.ENTRIES = 2;
PathConstraintPositionTimeline.PREV_TIME = -2;
PathConstraintPositionTimeline.PREV_VALUE = -1;
PathConstraintPositionTimeline.VALUE = 1;

/**
 * Changes a path constraint's {@link Tiny.spine.PathConstraint#spacing}.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.PathConstraintPositionTimeline
 */
class PathConstraintSpacingTimeline extends PathConstraintPositionTimeline {
  /**
   *
   * @param {number} frameCount
   */
  constructor(frameCount) {
    super(frameCount);
  }
  /**
   * @see {Tiny.spine.Timeline#getPropertyId}
   * @return {number}
   */
  getPropertyId() {
    return (TimelineType.pathConstraintSpacing << 24) + this.pathConstraintIndex;
  }

  /**
   * @see {Tiny.spine.Timeline#apply}
   */
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    const frames = this.frames;
    const constraint = skeleton.pathConstraints[this.pathConstraintIndex];

    if (!constraint.active) {
      return;
    }
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          constraint.spacing = constraint.data.spacing;
          return;
        case MixBlend.first:
          constraint.spacing += (constraint.data.spacing - constraint.spacing) * alpha;
      }
      return;
    }

    let spacing = 0;

    if (time >= frames[frames.length - PathConstraintSpacingTimeline.ENTRIES]) { // Time is after last frame.
      spacing = frames[frames.length + PathConstraintSpacingTimeline.PREV_VALUE];
    } else {
      // Interpolate between the previous frame and the current frame.
      const frame = Animation.binarySearch(frames, time, PathConstraintSpacingTimeline.ENTRIES);

      spacing = frames[frame + PathConstraintSpacingTimeline.PREV_VALUE];

      const frameTime = frames[frame];
      const denominator = frames[frame + PathConstraintSpacingTimeline.PREV_TIME] - frameTime;
      const percent = this.getCurvePercent(
        frame / PathConstraintSpacingTimeline.ENTRIES - 1,
        1 - (time - frameTime) / denominator,
      );

      spacing += (frames[frame + PathConstraintSpacingTimeline.VALUE] - spacing) * percent;
    }

    if (blend === MixBlend.setup) {
      constraint.spacing = constraint.data.spacing + (spacing - constraint.data.spacing) * alpha;
    } else {
      constraint.spacing += (spacing - constraint.spacing) * alpha;
    }
  }
}

/**
 * Changes a transform constraint's {@link Tiny.spine.PathConstraint#rotateMix} and
 * {@link Tiny.spine.TransformConstraint#translateMix}.
 *
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.CurveTimeline
 */
class PathConstraintMixTimeline extends CurveTimeline {
  /**
   *
   * @param {number} frameCount
   */
  constructor(frameCount) {
    super(frameCount);
    /**
     * The index of the path constraint slot in {@link Tiny.spine.Skeleton#getPathConstraints()} that will be changed.
     *
     * @name pathConstraintIndex
     * @memberof Tiny.spien.PathConstraintMixTimeline.prototype
     * @type {number}
     */

    /**
     * The time in seconds, rotate mix, and translate mix for each key frame.
     *
     * @type {number[]}
     */
    this.frames = newFloatArray(frameCount * PathConstraintMixTimeline.ENTRIES);
  }

  /**
   * @see {Tiny.spine.Timeline#getPropertyId}
   * @return {number}
   */
  getPropertyId() {
    return (TimelineType.pathConstraintMix << 24) + this.pathConstraintIndex;
  }

  /**
   * The time in seconds, rotate mix, and translate mix for the specified key frame.
   *
   * @param {number} frameIndex
   * @param {number} time
   * @param {number} rotateMix
   * @param {number} translateMix
   */
  setFrame(frameIndex, time, rotateMix, translateMix) {
    frameIndex *= PathConstraintMixTimeline.ENTRIES;
    this.frames[frameIndex] = time;
    this.frames[frameIndex + PathConstraintMixTimeline.ROTATE] = rotateMix;
    this.frames[frameIndex + PathConstraintMixTimeline.TRANSLATE] = translateMix;
  }

  /**
   * @see {Tiny.spine.Timeline#apply}
   */
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    const frames = this.frames;
    const constraint = skeleton.pathConstraints[this.pathConstraintIndex];

    if (!constraint.active) {
      return;
    }
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          constraint.rotateMix = constraint.data.rotateMix;
          constraint.translateMix = constraint.data.translateMix;
          return;
        case MixBlend.first:
          constraint.rotateMix += (constraint.data.rotateMix - constraint.rotateMix) * alpha;
          constraint.translateMix += (constraint.data.translateMix - constraint.translateMix) * alpha;
      }
      return;
    }

    let rotate = 0;
    let translate = 0;

    if (time >= frames[frames.length - PathConstraintMixTimeline.ENTRIES]) { // Time is after last frame.
      rotate = frames[frames.length + PathConstraintMixTimeline.PREV_ROTATE];
      translate = frames[frames.length + PathConstraintMixTimeline.PREV_TRANSLATE];
    } else {
      // Interpolate between the previous frame and the current frame.
      const frame = Animation.binarySearch(frames, time, PathConstraintMixTimeline.ENTRIES);

      rotate = frames[frame + PathConstraintMixTimeline.PREV_ROTATE];
      translate = frames[frame + PathConstraintMixTimeline.PREV_TRANSLATE];

      const frameTime = frames[frame];
      const denominator = frames[frame + PathConstraintMixTimeline.PREV_TIME] - frameTime;
      const percent = this.getCurvePercent(
        frame / PathConstraintMixTimeline.ENTRIES - 1,
        1 - (time - frameTime) / denominator,
      );

      rotate += (frames[frame + PathConstraintMixTimeline.ROTATE] - rotate) * percent;
      translate += (frames[frame + PathConstraintMixTimeline.TRANSLATE] - translate) * percent;
    }

    if (blend === MixBlend.setup) {
      constraint.rotateMix = constraint.data.rotateMix + (rotate - constraint.data.rotateMix) * alpha;
      constraint.translateMix = constraint.data.translateMix + (translate - constraint.data.translateMix) * alpha;
    } else {
      constraint.rotateMix += (rotate - constraint.rotateMix) * alpha;
      constraint.translateMix += (translate - constraint.translateMix) * alpha;
    }
  }
}
PathConstraintMixTimeline.ENTRIES = 3;
PathConstraintMixTimeline.PREV_TIME = -3;
PathConstraintMixTimeline.PREV_ROTATE = -2;
PathConstraintMixTimeline.PREV_TRANSLATE = -1;
PathConstraintMixTimeline.ROTATE = 1;
PathConstraintMixTimeline.TRANSLATE = 2;

export {
  MixDirection,
  TimelineType,
  MixBlend,
  Animation,
  CurveTimeline,
  RotateTimeline,
  TranslateTimeline,
  ScaleTimeline,
  ShearTimeline,
  ColorTimeline,
  TwoColorTimeline,
  AttachmentTimeline,
  DeformTimeline,
  EventTimeline,
  DrawOrderTimeline,
  IKConstraintTimeline,
  TransformConstraintTimeline,
  PathConstraintPositionTimeline,
  PathConstraintSpacingTimeline,
  PathConstraintMixTimeline,
};
