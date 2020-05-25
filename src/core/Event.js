/**
 * Stores the current pose values for an {@link Tiny.spine.Event}.
 *
 * See Timeline, AnimationStateListener, and
 * [Events](http://esotericsoftware.com/spine-events) in the Spine User Guide.
 *
 * @class
 * @memberof Tiny.spine
 */
class Event {
  /**
   *
   * @param {number} time
   * @param {Tiny.spine.EventData} data
   */
  constructor(time, data) {
    /**
     * @name intValue
     * @memberof Tiny.spine.Event.prototype
     * @type {number}
     */
    /**
     * @name floatValue
     * @memberof Tiny.spine.Event.prototype
     * @type {number}
     */
    /**
     * @name stringValue
     * @memberof Tiny.spine.Event.prototype
     * @type {string}
     */
    /**
     * @name volume
     * @memberof Tiny.spine.Event.prototype
     * @type {number}
     */
    /**
     * @name balance
     * @memberof Tiny.spine.Event.prototype
     * @type {number}
     */

    if (data == null) {
      throw new Error('data cannot be null.');
    }
    /**
     * @type {number}
     */
    this.time = time;
    /**
     * @type {Tiny.spine.EventData}
     */
    this.data = data;
  }
}

export default Event;
