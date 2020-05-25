/**
 * @class
 * @memberof Tiny.spine
 */
class Pool {
  /**
   *
   * @param {function} instantiator
   */
  constructor(instantiator) {
    /**
     * @private
     */
    this.items = [];
    /**
     * @type {function}
     */
    this.instantiator = instantiator;
  }

  /**
   * @return {*}
   */
  obtain() {
    return this.items.length > 0 ? this.items.pop() : this.instantiator();
  }

  /**
   *
   * @param {*} item
   */
  free(item) {
    if (item.reset) {
      item.reset();
    }
    this.items.push(item);
  }

  /**
   *
   * @param {array} items
   */
  freeAll(items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].reset) {
        items[i].reset();
      }
      this.items[i] = items[i];
    }
  }

  /**
   *
   */
  clear() {
    this.items.length = 0;
  }
}

export {
  Pool,
};
