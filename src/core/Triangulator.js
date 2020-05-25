import { Pool } from './utils';

/**
 * @class
 * @memberof Tiny.spine
 */
class Triangulator {
  /**
   *
   */
  constructor() {
    /**
     * @private
     */
    this.convexPolygons = [
      [],
    ];
    /**
     * @private
     */
    this.convexPolygonsIndices = [
      [],
    ];

    /**
     * @type {number[]}
     * @private
     */
    this.indicesArray = [];
    /**
     * @type {boolean[]}
     * @private
     */
    this.isConcaveArray = [];
    /**
     * @type {number[]}
     * @private
     */
    this.triangles = [];

    /**
     * @type {Tiny.spine.Pool}
     * @private
     */
    this.polygonPool = new Pool(() => {
      return [];
    });
    /**
     * @type {Tiny.spine.Pool}
     * @private
     */
    this.polygonIndicesPool = new Pool(() => {
      return [];
    });
  }

  /**
   *
   * @param {number[]} verticesArray
   * @return {number[]}
   */
  triangulate(verticesArray) {
    const vertices = verticesArray;
    let vertexCount = verticesArray.length >> 1;

    const indices = this.indicesArray;

    indices.length = 0;
    for (let i = 0; i < vertexCount; i++) {
      indices[i] = i;
    }

    const isConcave = this.isConcaveArray;

    isConcave.length = 0;
    for (let i = 0, n = vertexCount; i < n; ++i) {
      isConcave[i] = Triangulator.isConcave(i, vertexCount, vertices, indices);
    }

    const triangles = this.triangles;

    triangles.length = 0;

    while (vertexCount > 3) {
      // Find ear tip.
      let previous = vertexCount - 1;
      let i = 0;
      let next = 1;

      while (true) {
        // eslint-disable-next-line no-labels
        outer: if (!isConcave[i]) {
          const p1 = indices[previous] << 1;
          const p2 = indices[i] << 1;
          const p3 = indices[next] << 1;
          const p1x = vertices[p1];
          const p1y = vertices[p1 + 1];
          const p2x = vertices[p2];
          const p2y = vertices[p2 + 1];
          const p3x = vertices[p3];
          const p3y = vertices[p3 + 1];

          for (let ii = (next + 1) % vertexCount; ii !== previous; ii = (ii + 1) % vertexCount) {
            if (!isConcave[ii]) {
              continue;
            }
            const v = indices[ii] << 1;
            const vx = vertices[v];
            const vy = vertices[v + 1];

            if (Triangulator.positiveArea(p3x, p3y, p1x, p1y, vx, vy)) {
              if (Triangulator.positiveArea(p1x, p1y, p2x, p2y, vx, vy)) {
                // eslint-disable-next-line no-labels
                if (Triangulator.positiveArea(p2x, p2y, p3x, p3y, vx, vy)) break outer;
              }
            }
          }
          break;
        }

        if (next === 0) {
          do {
            if (!isConcave[i]) {
              break;
            }
            i--;
          } while (i > 0);
          break;
        }

        previous = i;
        i = next;
        next = (next + 1) % vertexCount;
      }

      // Cut ear tip.
      triangles.push(indices[(vertexCount + i - 1) % vertexCount]);
      triangles.push(indices[i]);
      triangles.push(indices[(i + 1) % vertexCount]);
      indices.splice(i, 1);
      isConcave.splice(i, 1);
      vertexCount--;

      const previousIndex = (vertexCount + i - 1) % vertexCount;
      const nextIndex = i === vertexCount ? 0 : i;

      isConcave[previousIndex] = Triangulator.isConcave(previousIndex, vertexCount, vertices, indices);
      isConcave[nextIndex] = Triangulator.isConcave(nextIndex, vertexCount, vertices, indices);
    }

    if (vertexCount === 3) {
      triangles.push(indices[2]);
      triangles.push(indices[0]);
      triangles.push(indices[1]);
    }

    return triangles;
  }

  /**
   *
   * @param {number[]} verticesArray
   * @param {number[]} triangles
   * @return {array<number[]>}
   */
  decompose(verticesArray, triangles) {
    const vertices = verticesArray;
    const convexPolygons = this.convexPolygons;

    this.polygonPool.freeAll(convexPolygons);
    convexPolygons.length = 0;

    const convexPolygonsIndices = this.convexPolygonsIndices;

    this.polygonIndicesPool.freeAll(convexPolygonsIndices);
    convexPolygonsIndices.length = 0;

    let polygonIndices = this.polygonIndicesPool.obtain();

    polygonIndices.length = 0;

    let polygon = this.polygonPool.obtain();

    polygon.length = 0;

    // Merge subsequent triangles if they form a triangle fan.
    let fanBaseIndex = -1;
    let lastWinding = 0;

    for (let i = 0, n = triangles.length; i < n; i += 3) {
      let t1 = triangles[i] << 1;
      let t2 = triangles[i + 1] << 1;
      let t3 = triangles[i + 2] << 1;
      let x1 = vertices[t1];
      let y1 = vertices[t1 + 1];
      let x2 = vertices[t2];
      let y2 = vertices[t2 + 1];
      let x3 = vertices[t3];
      let y3 = vertices[t3 + 1];

      // If the base of the last triangle is the same as this triangle, check if they form a convex polygon (triangle fan).
      let merged = false;

      if (fanBaseIndex === t1) {
        const o = polygon.length - 4;
        const winding1 = Triangulator.winding(polygon[o], polygon[o + 1], polygon[o + 2], polygon[o + 3], x3, y3);
        const winding2 = Triangulator.winding(x3, y3, polygon[0], polygon[1], polygon[2], polygon[3]);

        if (winding1 === lastWinding && winding2 === lastWinding) {
          polygon.push(x3);
          polygon.push(y3);
          polygonIndices.push(t3);
          merged = true;
        }
      }

      // Otherwise make this triangle the new base.
      if (!merged) {
        if (polygon.length > 0) {
          convexPolygons.push(polygon);
          convexPolygonsIndices.push(polygonIndices);
        } else {
          this.polygonPool.free(polygon);
          this.polygonIndicesPool.free(polygonIndices);
        }
        polygon = this.polygonPool.obtain();
        polygon.length = 0;
        polygon.push(x1);
        polygon.push(y1);
        polygon.push(x2);
        polygon.push(y2);
        polygon.push(x3);
        polygon.push(y3);
        polygonIndices = this.polygonIndicesPool.obtain();
        polygonIndices.length = 0;
        polygonIndices.push(t1);
        polygonIndices.push(t2);
        polygonIndices.push(t3);
        lastWinding = Triangulator.winding(x1, y1, x2, y2, x3, y3);
        fanBaseIndex = t1;
      }
    }

    if (polygon.length > 0) {
      convexPolygons.push(polygon);
      convexPolygonsIndices.push(polygonIndices);
    }

    // Go through the list of polygons and try to merge the remaining triangles with the found triangle fans.
    for (let i = 0, n = convexPolygons.length; i < n; i++) {
      polygonIndices = convexPolygonsIndices[i];
      if (polygonIndices.length === 0) {
        continue;
      }

      const firstIndex = polygonIndices[0];
      const lastIndex = polygonIndices[polygonIndices.length - 1];

      polygon = convexPolygons[i];

      const o = polygon.length - 4;
      let prevPrevX = polygon[o];
      let prevPrevY = polygon[o + 1];
      let prevX = polygon[o + 2];
      let prevY = polygon[o + 3];
      const firstX = polygon[0];
      const firstY = polygon[1];
      const secondX = polygon[2];
      const secondY = polygon[3];
      const winding = Triangulator.winding(prevPrevX, prevPrevY, prevX, prevY, firstX, firstY);

      for (let ii = 0; ii < n; ii++) {
        if (ii === i) {
          continue;
        }

        const otherIndices = convexPolygonsIndices[ii];

        if (otherIndices.length !== 3) {
          continue;
        }

        const otherFirstIndex = otherIndices[0];
        const otherSecondIndex = otherIndices[1];
        const otherLastIndex = otherIndices[2];

        const otherPoly = convexPolygons[ii];
        const x3 = otherPoly[otherPoly.length - 2];
        const y3 = otherPoly[otherPoly.length - 1];

        if (otherFirstIndex !== firstIndex || otherSecondIndex !== lastIndex) {
          continue;
        }

        const winding1 = Triangulator.winding(prevPrevX, prevPrevY, prevX, prevY, x3, y3);
        const winding2 = Triangulator.winding(x3, y3, firstX, firstY, secondX, secondY);

        if (winding1 === winding && winding2 === winding) {
          otherPoly.length = 0;
          otherIndices.length = 0;
          polygon.push(x3);
          polygon.push(y3);
          polygonIndices.push(otherLastIndex);
          prevPrevX = prevX;
          prevPrevY = prevY;
          prevX = x3;
          prevY = y3;
          ii = 0;
        }
      }
    }

    // Remove empty polygons that resulted from the merge step above.
    for (let i = convexPolygons.length - 1; i >= 0; i--) {
      polygon = convexPolygons[i];
      if (polygon.length === 0) {
        convexPolygons.splice(i, 1);
        this.polygonPool.free(polygon);
        polygonIndices = convexPolygonsIndices[i];
        convexPolygonsIndices.splice(i, 1);
        this.polygonIndicesPool.free(polygonIndices);
      }
    }

    return convexPolygons;
  }

  /**
   *
   * @static
   * @private
   * @param {number} index
   * @param {number} vertexCount
   * @param {number[]} vertices
   * @param {number[]} indices
   * @return {boolean}
   */
  static isConcave(index, vertexCount, vertices, indices) {
    const previous = indices[(vertexCount + index - 1) % vertexCount] << 1;
    const current = indices[index] << 1;
    const next = indices[(index + 1) % vertexCount] << 1;

    return !this.positiveArea(vertices[previous], vertices[previous + 1], vertices[current], vertices[current + 1], vertices[next], vertices[next + 1]);
  }

  /**
   * @static
   * @private
   * @param {number} p1x
   * @param {number} p1y
   * @param {number} p2x
   * @param {number} p2y
   * @param {number} p3x
   * @param {number} p3y
   * @return {boolean}
   */
  static positiveArea(p1x, p1y, p2x, p2y, p3x, p3y) {
    return p1x * (p3y - p2y) + p2x * (p1y - p3y) + p3x * (p2y - p1y) >= 0;
  }

  /**
   * @static
   * @private
   * @param {number} p1x
   * @param {number} p1y
   * @param {number} p2x
   * @param {number} p2y
   * @param {number} p3x
   * @param {number} p3y
   * @return {boolean}
   */
  static winding(p1x, p1y, p2x, p2y, p3x, p3y) {
    const px = p2x - p1x;
    const py = p2y - p1y;

    return p3x * py - p3y * px + px * p1y - p1x * py >= 0 ? 1 : -1;
  }
}

export default Triangulator;
