/**
 * @class
 * @memberof Tiny.spine
 */
class IntSet {
  constructor() {
    /**
     * @type {number[]}
     */
    this.array = [];
  }

  /**
   *
   * @param {number} value
   * @return {boolean}
   */
  add(value) {
    const contains = this.contains(value);

    this.array[value | 0] = value | 0;
    return !contains;
  }

  /**
   *
   * @param {number} value
   * @return {boolean}
   */
  contains(value) {
    return this.array[value | 0] !== undefined;
  }

  /**
   *
   * @param {number} value
   */
  remove(value) {
    this.array[value | 0] = undefined;
  }

  /**
   *
   */
  clear() {
    this.array.length = 0;
  }
}

export {
  IntSet,
};
