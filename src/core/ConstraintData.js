/**
 * The base class for all constraint datas.
 *
 * @class
 * @memberof Tiny.spine
 */
class ConstraintData {
  /**
   *
   * @param {string} name
   * @param {number} order
   * @param {boolean} skinRequired
   */
  constructor(name, order, skinRequired) {
    /**
     * @type {string}
     */
    this.name = name;
    /**
     * @type {number}
     */
    this.order = order;
    /**
     * @type {boolean}
     */
    this.skinRequired = skinRequired;
  }
}

export default ConstraintData;
