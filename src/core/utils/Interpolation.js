class Interpolation {
  apply(start, end, a) {
    return start + (end - start) * this.applyInternal(a);
  }
}

/**
 * @class
 * @memberof Tiny.spine
 */
class Pow extends Interpolation {
  /**
   *
   * @param {number} power=2
   */
  constructor(power = 2) {
    super();

    /**
     * @type {number}
     * @default 2
     */
    this.power = power;
  }

  /**
   *
   * @param {number} a
   * @return {number}
   */
  applyInternal(a) {
    if (a <= 0.5) {
      return Math.pow(a * 2, this.power) / 2;
    }
    return Math.pow((a - 1) * 2, this.power) / (this.power % 2 === 0 ? -2 : 2) + 1;
  }
}

/**
 * @class
 * @memberof Tiny.spine
 * @extends Tiny.spine.Pow
 */
class PowOut extends Pow {
  /**
   *
   * @param {number} a
   * @return {number}
   */
  applyInternal(a) {
    return Math.pow(a - 1, this.power) * (this.power % 2 === 0 ? -1 : 1) + 1;
  }
}

export {
  Pow,
  PowOut,
};
