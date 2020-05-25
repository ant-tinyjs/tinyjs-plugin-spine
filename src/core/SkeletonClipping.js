import { setArraySize } from './utils';
import Triangulator from './Triangulator';

/**
 * @class
 * @memberof Tiny.spine
 */
class SkeletonClipping {
  constructor() {
    /**
     * @private
     * @type {Tiny.spine.Triangulator}
     */
    this.triangulator = new Triangulator();
    /**
     * @private
     * @type {number[]}
     * @default []
     */
    this.clippingPolygon = [];
    /**
     * @private
     * @type {number[]}
     * @default []
     */
    this.clipOutput = [];
    /**
     * @type {number[]}
     * @default []
     */
    this.clippedVertices = [];
    /**
     * @type {number[]}
     * @default []
     */
    this.clippedTriangles = [];
    /**
     * @private
     * @type {number[]}
     * @default []
     */
    this.scratch = [];
    /**
     * @name clipAttachment
     * @memberof Tiny.spine.SkeletonClipping.prototype
     * @type {Tiny.spine.ClippingAttachment}
     * @private
     */
    /**
     * @private
     */
    this.clippingPolygons = [
      [],
    ];
  }

  /**
   *
   * @param {Tiny.spine.Slot} slot
   * @param {Tiny.spine.ClippingAttachment} clip
   * @return {number}
   */
  clipStart(slot, clip) {
    if (this.clipAttachment != null) {
      return 0;
    }
    this.clipAttachment = clip;

    const n = clip.worldVerticesLength;
    const vertices = setArraySize(this.clippingPolygon, n);

    clip.computeWorldVertices(slot, 0, n, vertices, 0, 2);

    const clippingPolygon = this.clippingPolygon;

    SkeletonClipping.makeClockwise(clippingPolygon);

    const clippingPolygons = this.clippingPolygons = this.triangulator.decompose(clippingPolygon, this.triangulator.triangulate(clippingPolygon));

    for (let i = 0, n = clippingPolygons.length; i < n; i++) {
      const polygon = clippingPolygons[i];

      SkeletonClipping.makeClockwise(polygon);
      polygon.push(polygon[0]);
      polygon.push(polygon[1]);
    }

    return clippingPolygons.length;
  }

  /**
   *
   * @param {Tiny.spine.Slot} slot
   */
  clipEndWithSlot(slot) {
    if (this.clipAttachment != null && this.clipAttachment.endSlot === slot.data) {
      this.clipEnd();
    }
  }

  /**
   *
   */
  clipEnd() {
    if (this.clipAttachment == null) {
      return;
    }
    this.clipAttachment = null;
    this.clippingPolygons = null;
    this.clippedVertices.length = 0;
    this.clippedTriangles.length = 0;
    this.clippingPolygon.length = 0;
  }

  /**
   * @return {boolean}
   */
  isClipping() {
    return this.clipAttachment != null;
  }

  /**
   *
   * @param {number[]} vertices
   * @param {number} verticesLength
   * @param {number[]} triangles
   * @param {number} trianglesLength
   * @param {number[]} uvs
   * @param {Tiny.spine.Color} light
   * @param {Tiny.spine.Color} dark
   * @param {boolean} twoColor
   */
  clipTriangles(vertices, verticesLength, triangles, trianglesLength, uvs, light, dark, twoColor) {
    const clipOutput = this.clipOutput;
    const clippedVertices = this.clippedVertices;
    const clippedTriangles = this.clippedTriangles;
    const polygons = this.clippingPolygons;
    const polygonsCount = this.clippingPolygons.length;
    const vertexSize = twoColor ? 12 : 8;

    let index = 0;
    clippedVertices.length = 0;
    clippedTriangles.length = 0;

    // eslint-disable-next-line no-labels
    outer: for (let i = 0; i < trianglesLength; i += 3) {
      let vertexOffset = triangles[i] << 1;
      const x1 = vertices[vertexOffset];
      const y1 = vertices[vertexOffset + 1];
      const u1 = uvs[vertexOffset];
      const v1 = uvs[vertexOffset + 1];

      vertexOffset = triangles[i + 1] << 1;

      const x2 = vertices[vertexOffset];
      const y2 = vertices[vertexOffset + 1];
      const u2 = uvs[vertexOffset];
      const v2 = uvs[vertexOffset + 1];

      vertexOffset = triangles[i + 2] << 1;

      const x3 = vertices[vertexOffset];
      const y3 = vertices[vertexOffset + 1];
      const u3 = uvs[vertexOffset];
      const v3 = uvs[vertexOffset + 1];

      for (let p = 0; p < polygonsCount; p++) {
        let s = clippedVertices.length;

        if (this.clip(x1, y1, x2, y2, x3, y3, polygons[p], clipOutput)) {
          const clipOutputLength = clipOutput.length;

          if (clipOutputLength === 0) {
            continue;
          }
          const d0 = y2 - y3;
          const d1 = x3 - x2;
          const d2 = x1 - x3;
          const d4 = y3 - y1;
          const d = 1 / (d0 * d2 + d1 * (y1 - y3));

          let clipOutputCount = clipOutputLength >> 1;
          const clipOutputItems = this.clipOutput;
          const clippedVerticesItems = setArraySize(clippedVertices, s + clipOutputCount * vertexSize);

          for (let ii = 0; ii < clipOutputLength; ii += 2) {
            const x = clipOutputItems[ii];
            const y = clipOutputItems[ii + 1];

            clippedVerticesItems[s] = x;
            clippedVerticesItems[s + 1] = y;
            clippedVerticesItems[s + 2] = light.r;
            clippedVerticesItems[s + 3] = light.g;
            clippedVerticesItems[s + 4] = light.b;
            clippedVerticesItems[s + 5] = light.a;

            const c0 = x - x3;
            const c1 = y - y3;
            const a = (d0 * c0 + d1 * c1) * d;
            const b = (d4 * c0 + d2 * c1) * d;
            const c = 1 - a - b;

            clippedVerticesItems[s + 6] = u1 * a + u2 * b + u3 * c;
            clippedVerticesItems[s + 7] = v1 * a + v2 * b + v3 * c;
            if (twoColor) {
              clippedVerticesItems[s + 8] = dark.r;
              clippedVerticesItems[s + 9] = dark.g;
              clippedVerticesItems[s + 10] = dark.b;
              clippedVerticesItems[s + 11] = dark.a;
            }
            s += vertexSize;
          }

          s = clippedTriangles.length;

          const clippedTrianglesItems = setArraySize(clippedTriangles, s + 3 * (clipOutputCount - 2));

          clipOutputCount--;
          for (let ii = 1; ii < clipOutputCount; ii++) {
            clippedTrianglesItems[s] = index;
            clippedTrianglesItems[s + 1] = (index + ii);
            clippedTrianglesItems[s + 2] = (index + ii + 1);
            s += 3;
          }
          index += clipOutputCount + 1;
        } else {
          const clippedVerticesItems = setArraySize(clippedVertices, s + 3 * vertexSize);

          clippedVerticesItems[s] = x1;
          clippedVerticesItems[s + 1] = y1;
          clippedVerticesItems[s + 2] = light.r;
          clippedVerticesItems[s + 3] = light.g;
          clippedVerticesItems[s + 4] = light.b;
          clippedVerticesItems[s + 5] = light.a;
          if (!twoColor) {
            clippedVerticesItems[s + 6] = u1;
            clippedVerticesItems[s + 7] = v1;

            clippedVerticesItems[s + 8] = x2;
            clippedVerticesItems[s + 9] = y2;
            clippedVerticesItems[s + 10] = light.r;
            clippedVerticesItems[s + 11] = light.g;
            clippedVerticesItems[s + 12] = light.b;
            clippedVerticesItems[s + 13] = light.a;
            clippedVerticesItems[s + 14] = u2;
            clippedVerticesItems[s + 15] = v2;

            clippedVerticesItems[s + 16] = x3;
            clippedVerticesItems[s + 17] = y3;
            clippedVerticesItems[s + 18] = light.r;
            clippedVerticesItems[s + 19] = light.g;
            clippedVerticesItems[s + 20] = light.b;
            clippedVerticesItems[s + 21] = light.a;
            clippedVerticesItems[s + 22] = u3;
            clippedVerticesItems[s + 23] = v3;
          } else {
            clippedVerticesItems[s + 6] = u1;
            clippedVerticesItems[s + 7] = v1;
            clippedVerticesItems[s + 8] = dark.r;
            clippedVerticesItems[s + 9] = dark.g;
            clippedVerticesItems[s + 10] = dark.b;
            clippedVerticesItems[s + 11] = dark.a;

            clippedVerticesItems[s + 12] = x2;
            clippedVerticesItems[s + 13] = y2;
            clippedVerticesItems[s + 14] = light.r;
            clippedVerticesItems[s + 15] = light.g;
            clippedVerticesItems[s + 16] = light.b;
            clippedVerticesItems[s + 17] = light.a;
            clippedVerticesItems[s + 18] = u2;
            clippedVerticesItems[s + 19] = v2;
            clippedVerticesItems[s + 20] = dark.r;
            clippedVerticesItems[s + 21] = dark.g;
            clippedVerticesItems[s + 22] = dark.b;
            clippedVerticesItems[s + 23] = dark.a;

            clippedVerticesItems[s + 24] = x3;
            clippedVerticesItems[s + 25] = y3;
            clippedVerticesItems[s + 26] = light.r;
            clippedVerticesItems[s + 27] = light.g;
            clippedVerticesItems[s + 28] = light.b;
            clippedVerticesItems[s + 29] = light.a;
            clippedVerticesItems[s + 30] = u3;
            clippedVerticesItems[s + 31] = v3;
            clippedVerticesItems[s + 32] = dark.r;
            clippedVerticesItems[s + 33] = dark.g;
            clippedVerticesItems[s + 34] = dark.b;
            clippedVerticesItems[s + 35] = dark.a;
          }

          s = clippedTriangles.length;

          const clippedTrianglesItems = setArraySize(clippedTriangles, s + 3);

          clippedTrianglesItems[s] = index;
          clippedTrianglesItems[s + 1] = (index + 1);
          clippedTrianglesItems[s + 2] = (index + 2);
          index += 3;
          // eslint-disable-next-line no-labels
          continue outer;
        }
      }
    }
  }

  /**
   * Clips the input triangle against the convex, clockwise clipping area. If the triangle lies entirely within the clipping
   * area, false is returned. The clipping area must duplicate the first vertex at the end of the vertices list.
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} x3
   * @param {number} y3
   * @param {number[]} clippingArea
   * @param {number[]} output
   */
  clip(x1, y1, x2, y2, x3, y3, clippingArea, output) {
    const originalOutput = output;
    let clipped = false;

    // Avoid copy at the end.
    let input = null;

    if (clippingArea.length % 4 >= 2) {
      input = output;
      output = this.scratch;
    } else {
      input = this.scratch;
    }

    input.length = 0;
    input.push(x1);
    input.push(y1);
    input.push(x2);
    input.push(y2);
    input.push(x3);
    input.push(y3);
    input.push(x1);
    input.push(y1);
    output.length = 0;

    const clippingVertices = clippingArea;
    const clippingVerticesLast = clippingArea.length - 4;

    // eslint-disable-next-line semi-spacing
    for (let i = 0;; i += 2) {
      const edgeX = clippingVertices[i];
      const edgeY = clippingVertices[i + 1];
      const edgeX2 = clippingVertices[i + 2];
      const edgeY2 = clippingVertices[i + 3];
      const deltaX = edgeX - edgeX2;
      const deltaY = edgeY - edgeY2;

      const inputVertices = input;
      const inputVerticesLength = input.length - 2;
      const outputStart = output.length;

      for (let ii = 0; ii < inputVerticesLength; ii += 2) {
        const inputX = inputVertices[ii];
        const inputY = inputVertices[ii + 1];
        const inputX2 = inputVertices[ii + 2];
        const inputY2 = inputVertices[ii + 3];
        const side2 = deltaX * (inputY2 - edgeY2) - deltaY * (inputX2 - edgeX2) > 0;

        if (deltaX * (inputY - edgeY2) - deltaY * (inputX - edgeX2) > 0) {
          if (side2) { // v1 inside, v2 inside
            output.push(inputX2);
            output.push(inputY2);
            continue;
          }
          // v1 inside, v2 outside
          const c0 = inputY2 - inputY;
          const c2 = inputX2 - inputX;
          const ua = (c2 * (edgeY - inputY) - c0 * (edgeX - inputX)) / (c0 * (edgeX2 - edgeX) - c2 * (edgeY2 - edgeY));

          output.push(edgeX + (edgeX2 - edgeX) * ua);
          output.push(edgeY + (edgeY2 - edgeY) * ua);
        } else if (side2) { // v1 outside, v2 inside
          const c0 = inputY2 - inputY;
          const c2 = inputX2 - inputX;
          const ua = (c2 * (edgeY - inputY) - c0 * (edgeX - inputX)) / (c0 * (edgeX2 - edgeX) - c2 * (edgeY2 - edgeY));

          output.push(edgeX + (edgeX2 - edgeX) * ua);
          output.push(edgeY + (edgeY2 - edgeY) * ua);
          output.push(inputX2);
          output.push(inputY2);
        }
        clipped = true;
      }

      if (outputStart === output.length) { // All edges outside.
        originalOutput.length = 0;
        return true;
      }

      output.push(output[0]);
      output.push(output[1]);

      if (i === clippingVerticesLast) {
        break;
      }

      const temp = output;

      output = input;
      output.length = 0;
      input = temp;
    }

    if (originalOutput !== output) {
      originalOutput.length = 0;
      for (let i = 0, n = output.length - 2; i < n; i++) {
        originalOutput[i] = output[i];
      }
    } else {
      originalOutput.length = originalOutput.length - 2;
    }

    return clipped;
  }

  /**
   * @static
   * @param {number[]} polygon
   */
  static makeClockwise(polygon) {
    const vertices = polygon;
    const verticeslength = polygon.length;

    let area = vertices[verticeslength - 2] * vertices[1] - vertices[0] * vertices[verticeslength - 1];
    let p1x = 0;
    let p1y = 0;
    let p2x = 0;
    let p2y = 0;

    for (let i = 0, n = verticeslength - 3; i < n; i += 2) {
      p1x = vertices[i];
      p1y = vertices[i + 1];
      p2x = vertices[i + 2];
      p2y = vertices[i + 3];
      area += p1x * p2y - p2x * p1y;
    }
    if (area < 0) {
      return;
    }

    for (let i = 0, lastX = verticeslength - 2, n = verticeslength >> 1; i < n; i += 2) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const other = lastX - i;

      vertices[i] = vertices[other];
      vertices[i + 1] = vertices[other + 1];
      vertices[other] = x;
      vertices[other + 1] = y;
    }
  }
}

export {
  SkeletonClipping,
};
