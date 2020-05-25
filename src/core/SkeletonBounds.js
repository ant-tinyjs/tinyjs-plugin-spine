import { Pool, newFloatArray } from './utils';
import BoundingBoxAttachment from './attachments/BoundingBoxAttachment';

/**
 * Collects each visible {@link Tiny.spine.BoundingBoxAttachment} and computes the world vertices for its polygon. The polygon vertices are
 * provided along with convenience methods for doing hit detection.
 *
 * @class
 * @memberof Tiny.spine
 */
class SkeletonBounds {
  constructor() {
    /**
     * The left edge of the axis aligned bounding box.
     *
     * @type {number}
     * @default 0
     */
    this.minX = 0;
    /**
     * The bottom edge of the axis aligned bounding box.
     *
     * @type {number}
     * @default 0
     */
    this.minY = 0;
    /**
     * The right edge of the axis aligned bounding box.
     *
     * @type {number}
     * @default 0
     */
    this.maxX = 0;
    /**
     * The top edge of the axis aligned bounding box.
     *
     * @type {number}
     * @default 0
     */
    this.maxY = 0;
    /**
     * The visible bounding boxes.
     *
     * @type {Tiny.spine.BoundingBoxAttachment[]}
     * @default []
     */
    this.boundingBoxes = [];
    /**
     * The world vertices for the bounding box polygons.
     *
     * @type {array<number[]>}
     * @default [[]]
     */
    this.polygons = [
      [],
    ];
    /**
     * @private
     */
    this.polygonPool = new Pool(() => {
      return newFloatArray(16);
    });
  }

  /**
   * Clears any previous polygons, finds all visible bounding box attachments, and computes the world vertices for each bounding
   * box's polygon.
   *
   * @param {Tiny.spine.Skeleton} skeleton
   * @param {boolean} updateAabb - If true, the axis aligned bounding box containing all the polygons is computed. If false, the
   *           SkeletonBounds AABB methods will always return true.
   */
  update(skeleton, updateAabb) {
    if (skeleton == null) {
      throw new Error('skeleton cannot be null.');
    }
    const boundingBoxes = this.boundingBoxes;
    const polygons = this.polygons;
    const polygonPool = this.polygonPool;
    const slots = skeleton.slots;
    const slotCount = slots.length;

    boundingBoxes.length = 0;
    polygonPool.freeAll(polygons);
    polygons.length = 0;

    for (let i = 0; i < slotCount; i++) {
      const slot = slots[i];

      if (!slot.bone.active) {
        continue;
      }

      const attachment = slot.getAttachment();

      if (attachment instanceof BoundingBoxAttachment) {
        const boundingBox = attachment;

        boundingBoxes.push(boundingBox);

        let polygon = polygonPool.obtain();

        if (polygon.length !== boundingBox.worldVerticesLength) {
          polygon = newFloatArray(boundingBox.worldVerticesLength);
        }
        polygons.push(polygon);
        boundingBox.computeWorldVertices(slot, 0, boundingBox.worldVerticesLength, polygon, 0, 2);
      }
    }

    if (updateAabb) {
      this.aabbCompute();
    } else {
      this.minX = Number.POSITIVE_INFINITY;
      this.minY = Number.POSITIVE_INFINITY;
      this.maxX = Number.NEGATIVE_INFINITY;
      this.maxY = Number.NEGATIVE_INFINITY;
    }
  }

  /**
   *
   */
  aabbCompute() {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    const polygons = this.polygons;

    for (let i = 0, n = polygons.length; i < n; i++) {
      const polygon = polygons[i];
      const vertices = polygon;

      for (let ii = 0, nn = polygon.length; ii < nn; ii += 2) {
        const x = vertices[ii];
        const y = vertices[ii + 1];

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  /**
   * Returns true if the axis aligned bounding box contains the point.
   *
   * @param {number} x
   * @param {number} y
   */
  aabbContainsPoint(x, y) {
    return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;
  }

  /**
   * Returns true if the axis aligned bounding box intersects the line segment.
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   */
  aabbIntersectsSegment(x1, y1, x2, y2) {
    const minX = this.minX;
    const minY = this.minY;
    const maxX = this.maxX;
    const maxY = this.maxY;

    if (
      (x1 <= minX && x2 <= minX) ||
      (y1 <= minY && y2 <= minY) ||
      (x1 >= maxX && x2 >= maxX) ||
      (y1 >= maxY && y2 >= maxY)
    ) {
      return false;
    }

    const m = (y2 - y1) / (x2 - x1);
    let y = m * (minX - x1) + y1;

    if (y > minY && y < maxY) return true;

    y = m * (maxX - x1) + y1;

    if (y > minY && y < maxY) return true;

    let x = (minY - y1) / m + x1;

    if (x > minX && x < maxX) return true;

    x = (maxY - y1) / m + x1;

    if (x > minX && x < maxX) return true;
    return false;
  }

  /**
   * Returns true if the axis aligned bounding box intersects the axis aligned bounding box of the specified bounds.
   *
   * @param {Tiny.spine.SkeletonBounds} bounds
   */
  aabbIntersectsSkeleton(bounds) {
    return this.minX < bounds.maxX && this.maxX > bounds.minX && this.minY < bounds.maxY && this.maxY > bounds.minY;
  }

  /**
   * Returns the first bounding box attachment that contains the point, or null.
   * When doing many checks, it is usually more efficient to only call this method if {@link Tiny.spine.SkeletonBounds#aabbContainsPoint} returns true.
   *
   * @param {number} x
   * @param {number} y
   * @return {Tiny.spine.BoundingBoxAttachment}
   */
  containsPoint(x, y) {
    const polygons = this.polygons;

    for (let i = 0, n = polygons.length; i < n; i++) {
      if (this.containsPointPolygon(polygons[i], x, y)) {
        return this.boundingBoxes[i];
      }
    }
    return null;
  }

  /**
   * Returns true if the polygon contains the point.

   * @param {number[]} polygon
   * @param {number} x
   * @param {number} y
   */
  containsPointPolygon(polygon, x, y) {
    const vertices = polygon;
    const nn = polygon.length;

    let prevIndex = nn - 2;
    let inside = false;

    for (let ii = 0; ii < nn; ii += 2) {
      const vertexY = vertices[ii + 1];
      const prevY = vertices[prevIndex + 1];

      if ((vertexY < y && prevY >= y) || (prevY < y && vertexY >= y)) {
        const vertexX = vertices[ii];

        if (vertexX + (y - vertexY) / (prevY - vertexY) * (vertices[prevIndex] - vertexX) < x) {
          inside = !inside;
        }
      }
      prevIndex = ii;
    }
    return inside;
  }

  /**
   * Returns the first bounding box attachment that contains any part of the line segment, or null.
   * When doing many checks, it is usually more efficient to only call this method if {@link Tiny.spine.SkeletonBounds#aabbIntersectsSegment} returns true.
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   */
  intersectsSegment(x1, y1, x2, y2) {
    const polygons = this.polygons;

    for (let i = 0, n = polygons.length; i < n; i++) {
      if (this.intersectsSegmentPolygon(polygons[i], x1, y1, x2, y2)) {
        return this.boundingBoxes[i];
      }
    }
    return null;
  }

  /**
   * Returns true if the polygon contains any part of the line segment.
   *
   * @param {number[]} polygon
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   */
  intersectsSegmentPolygon(polygon, x1, y1, x2, y2) {
    const vertices = polygon;
    const nn = polygon.length;

    const width12 = x1 - x2;
    const height12 = y1 - y2;
    const det1 = x1 * y2 - y1 * x2;
    let x3 = vertices[nn - 2];
    let y3 = vertices[nn - 1];

    for (let ii = 0; ii < nn; ii += 2) {
      const x4 = vertices[ii];
      const y4 = vertices[ii + 1];
      const det2 = x3 * y4 - y3 * x4;
      const width34 = x3 - x4;
      const height34 = y3 - y4;
      const det3 = width12 * height34 - height12 * width34;
      const x = (det1 * width34 - width12 * det2) / det3;

      if (((x >= x3 && x <= x4) || (x >= x4 && x <= x3)) && ((x >= x1 && x <= x2) || (x >= x2 && x <= x1))) {
        const y = (det1 * height34 - height12 * det2) / det3;

        if (((y >= y3 && y <= y4) || (y >= y4 && y <= y3)) && ((y >= y1 && y <= y2) || (y >= y2 && y <= y1))) {
          return true;
        }
      }
      x3 = x4;
      y3 = y4;
    }
    return false;
  }

  /**
   * Returns the polygon for the specified bounding box, or null.
   *
   * @param {Tiny.spine.BoundingBoxAttachment} boundingBox
   */
  getPolygon(boundingBox) {
    if (boundingBox == null) {
      throw new Error('boundingBox cannot be null.');
    }

    const index = this.boundingBoxes.indexOf(boundingBox);

    return index === -1 ? null : this.polygons[index];
  }

  /**
   * The width of the axis aligned bounding box.
   *
   * @return {number}
   */
  getWidth() {
    return this.maxX - this.minX;
  }

  /**
   * The height of the axis aligned bounding box.
   *
   * @return {number}
   */
  getHeight() {
    return this.maxY - this.minY;
  }
}

export default SkeletonBounds;
